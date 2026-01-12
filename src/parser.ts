/**
 * Workout Parser
 *
 * Parses Intervals.icu workout text format into WorkoutStructure AST.
 * Calculates duration and training metrics from the workout structure.
 */

import type { SportZones } from './types/zones'
import type { StructuredWorkout } from './types/structured-workout'
import type {
  WorkoutStructure,
  WorkoutSection,
  WorkoutStep,
  StepDuration,
  StepTarget,
  PowerValue,
  HRValue,
  PaceValue,
  PowerZone,
  HRZone,
  PaceZone,
  PaceUnit,
  StepPrompt,
  StepFlag,
  IntensityOverride,
} from './types/workout-structure'

// ══════════════════════════════════════════════════════════════
// MAIN PARSER
// ══════════════════════════════════════════════════════════════

/**
 * Parse workout text into StructuredWorkout with duration and metrics.
 */
export function parseWorkout(text: string, sportZones: SportZones): StructuredWorkout {
  const structure = parseWorkoutStructure(text)
  const durationSeconds = calculateDuration(structure)
  const metrics = calculateMetrics(structure, sportZones, durationSeconds)

  return {
    structure,
    durationSeconds,
    metrics,
  }
}

/**
 * Parse workout text into WorkoutStructure AST (without metrics).
 *
 * Header detection rules:
 * - If first line is followed by empty line then section/steps → first line is title
 * - If first line is immediately followed by steps → first line is section header
 * - Category: lines are always category
 */
export function parseWorkoutStructure(text: string): WorkoutStructure {
  const lines = text.split('\n')
  const parseNotes: string[] = []

  // Two-pass parsing: first determine structure, then parse
  const nonEmptyLines: { line: string; afterEmpty: boolean }[] = []
  let prevWasEmpty = true

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) {
      prevWasEmpty = true
      continue
    }
    nonEmptyLines.push({ line, afterEmpty: prevWasEmpty })
    prevWasEmpty = false
  }

  let header: WorkoutStructure['header'] | undefined
  const sections: WorkoutSection[] = []
  let currentSection: WorkoutSection | undefined
  const descriptionLines: string[] = []

  let i = 0
  let titleSet = false
  let inDescription = false

  while (i < nonEmptyLines.length) {
    const { line, afterEmpty } = nonEmptyLines[i]
    const nextEntry = nonEmptyLines[i + 1]

    // Category line
    if (line.toLowerCase().startsWith('category:')) {
      header = header ?? {}
      header.category = line.slice(9).trim()
      i++
      continue
    }

    // Step line
    if (line.startsWith('-')) {
      inDescription = false
      const stepText = line.slice(1).trim()
      const step = parseStep(stepText, parseNotes)

      if (!currentSection) {
        currentSection = { steps: [] }
        sections.push(currentSection)
      }

      currentSection.steps.push(step)
      i++
      continue
    }

    // Non-step, non-category line
    if (!titleSet && sections.length === 0 && !currentSection) {
      // First content line - is it title or section header?
      // Check if next line is a step (immediately follows) or there's empty line + section
      const nextIsStep = nextEntry && nextEntry.line.startsWith('-') && !nextEntry.afterEmpty
      const looksLikeSectionHeader =
        line.match(/^(\d+)x\s*$/i) || // standalone repeat
        line.match(/^.+\s+\d+x\s*$/i) // section with repeat

      if (nextIsStep || looksLikeSectionHeader) {
        // It's a section header
        currentSection = parseSection(line)
        sections.push(currentSection)
      } else if (nextEntry && nextEntry.afterEmpty) {
        // Empty line follows - this is title
        header = header ?? {}
        header.title = line
        titleSet = true
        inDescription = true
      } else if (nextEntry && !nextEntry.line.startsWith('-')) {
        // Next line is another non-step line without empty - could be description
        header = header ?? {}
        header.title = line
        titleSet = true
        inDescription = true
      } else {
        // Single line before steps without empty line - section header
        currentSection = parseSection(line)
        sections.push(currentSection)
      }
    } else if (inDescription && !afterEmpty) {
      // Description line (follows title without empty line)
      descriptionLines.push(line)
    } else {
      // Section header
      inDescription = false
      currentSection = parseSection(line)
      sections.push(currentSection)
    }

    i++
  }

  // Finalize header
  if (descriptionLines.length > 0) {
    header = header ?? {}
    header.descriptionLines = descriptionLines
  }

  if (parseNotes.length > 0) {
    return { header, sections, parseNotes }
  }

  return { header, sections }
}

// ══════════════════════════════════════════════════════════════
// SECTION PARSER
// ══════════════════════════════════════════════════════════════

function parseSection(line: string): WorkoutSection {
  // Check for standalone repeat: "6x"
  const standaloneMatch = line.match(/^(\d+)x\s*$/i)
  if (standaloneMatch) {
    return {
      repeat: { times: parseInt(standaloneMatch[1], 10), isStandalone: true },
      steps: [],
    }
  }

  // Check for section with repeat: "Main set 4x"
  const repeatMatch = line.match(/^(.+?)\s+(\d+)x\s*$/i)
  if (repeatMatch) {
    return {
      title: repeatMatch[1].trim(),
      repeat: { times: parseInt(repeatMatch[2], 10) },
      steps: [],
    }
  }

  // Plain section header
  return { title: line, steps: [] }
}

// ══════════════════════════════════════════════════════════════
// STEP PARSER
// ══════════════════════════════════════════════════════════════

function parseStep(text: string, parseNotes: string[]): WorkoutStep {
  let remaining = text
  let label: string | undefined
  let duration: StepDuration | undefined
  let target: StepTarget | undefined
  let cadence: WorkoutStep['cadence']
  let ramp: WorkoutStep['ramp']
  let restAfter: WorkoutStep['restAfter']
  let repeat: WorkoutStep['repeat']
  const prompts: StepPrompt[] = []
  const flags: StepFlag[] = []

  // Extract timed prompts (e.g., "60^30 Stay relaxed")
  const promptMatches = remaining.matchAll(/(\d+)\^(\d+)?\s*([^<!]+?)(?=\s*<!>|\s*\d+[msh']|\s*\d+-\d+%|\s*Z\d|\s*$)/gi)
  for (const match of promptMatches) {
    prompts.push({
      atSeconds: parseInt(match[1], 10),
      forSeconds: match[2] ? parseInt(match[2], 10) : undefined,
      text: match[3].trim(),
    })
    remaining = remaining.replace(match[0], ' ')
  }

  // Split by <!> for multiple prompts
  const parts = remaining.split('<!>')
  remaining = parts[parts.length - 1].trim()

  // Check for step repeat: "4x 30s ..."
  const stepRepeatMatch = remaining.match(/^(\d+)x\s+/)
  if (stepRepeatMatch) {
    repeat = { times: parseInt(stepRepeatMatch[1], 10) }
    remaining = remaining.slice(stepRepeatMatch[0].length)
  }

  // Parse tokens from remaining text
  const tokens = tokenize(remaining)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]

    // Duration
    if (!duration) {
      const parsedDuration = parseDuration(token)
      if (parsedDuration) {
        duration = parsedDuration
        continue
      }
    }

    // Ramp
    if (token.toLowerCase() === 'ramp' && nextToken) {
      const rampMatch = nextToken.match(/^(\d+)-(\d+)%$/)
      if (rampMatch) {
        ramp = {
          fromPct: parseInt(rampMatch[1], 10) / 100,
          toPct: parseInt(rampMatch[2], 10) / 100,
        }
        i++ // Skip next token
        continue
      }
    }

    // Freeride
    if (token.toLowerCase() === 'freeride') {
      target = { kind: 'freeride' }
      continue
    }

    // Target (power, HR, pace)
    if (!target || target.kind === 'freeride') {
      const parsedTarget = parseTarget(token, nextToken)
      if (parsedTarget.target) {
        target = parsedTarget.target
        if (parsedTarget.skipNext) i++
        continue
      }
    }

    // Cadence
    const cadenceMatch = token.match(/^(\d+)(?:-(\d+))?rpm$/i)
    if (cadenceMatch) {
      if (cadenceMatch[2]) {
        cadence = {
          rangeRpm: {
            min: parseInt(cadenceMatch[1], 10),
            max: parseInt(cadenceMatch[2], 10),
          },
        }
      } else {
        cadence = { rpm: parseInt(cadenceMatch[1], 10) }
      }
      continue
    }

    // Rest after (swimming)
    if (token.toLowerCase() === 'rest' && i > 0) {
      const prevToken = tokens[i - 1]
      const restMatch = prevToken.match(/^(\d+)s$/i)
      if (restMatch) {
        restAfter = { seconds: parseInt(restMatch[1], 10) }
      }
      continue
    }

    // Flags: hidepower, /hidepower
    if (token.toLowerCase() === 'hidepower' || token.toLowerCase() === '/hidepower') {
      flags.push({ kind: 'hidepower', enabled: token.startsWith('/') ? false : true })
      continue
    }

    // Flags: press lap
    if (token.toLowerCase() === 'press' && nextToken?.toLowerCase() === 'lap') {
      flags.push({ kind: 'press_lap' })
      i++
      continue
    }

    // Flags: intensity=
    const intensityMatch = token.match(/^intensity=(.+)$/i)
    if (intensityMatch) {
      const value = intensityMatch[1].toLowerCase() as IntensityOverride
      if (
        [
          'active',
          'recovery',
          'interval',
          'warmup',
          'cooldown',
          'rest',
          'other',
          'auto',
        ].includes(value)
      ) {
        flags.push({ kind: 'intensity_override', value })
      }
      continue
    }

    // If we haven't matched anything and don't have a duration yet,
    // this is likely part of the label
    if (!duration) {
      label = label ? `${label} ${token}` : token
    }
  }

  // Default duration if not found
  if (!duration) {
    duration = { kind: 'time', seconds: 0 }
    parseNotes.push(`No duration found in step: "${text}"`)
  }

  const step: WorkoutStep = { duration }

  if (label) step.label = label
  if (target) step.target = target
  if (cadence) step.cadence = cadence
  if (ramp) step.ramp = ramp
  if (restAfter) step.restAfter = restAfter
  if (repeat) step.repeat = repeat
  if (prompts.length > 0) step.prompts = prompts
  if (flags.length > 0) step.flags = flags

  return step
}

function tokenize(text: string): string[] {
  // Split by whitespace but keep compound tokens together
  return text.split(/\s+/).filter(Boolean)
}

// ══════════════════════════════════════════════════════════════
// DURATION PARSER
// ══════════════════════════════════════════════════════════════

function parseDuration(token: string): StepDuration | null {
  // Hours: 1h, 1hour
  const hoursMatch = token.match(/^(\d+(?:\.\d+)?)(h|hour|hours)$/i)
  if (hoursMatch) {
    return {
      kind: 'time',
      seconds: Math.round(parseFloat(hoursMatch[1]) * 3600),
      raw: token,
    }
  }

  // Minutes: 10m, 5', 5min
  const minsMatch = token.match(/^(\d+(?:\.\d+)?)(m|'|min|mins)$/i)
  if (minsMatch) {
    return {
      kind: 'time',
      seconds: Math.round(parseFloat(minsMatch[1]) * 60),
      raw: token,
    }
  }

  // Seconds: 30s, 30"
  const secsMatch = token.match(/^(\d+)(s|")$/i)
  if (secsMatch) {
    return {
      kind: 'time',
      seconds: parseInt(secsMatch[1], 10),
      raw: token,
    }
  }

  // Combined: 1m30, 1m30s, 1'30", 1h30m
  const combinedMatch = token.match(/^(\d+)(h|'|m)(\d+)(m|s|")?$/i)
  if (combinedMatch) {
    const first = parseInt(combinedMatch[1], 10)
    const firstUnit = combinedMatch[2].toLowerCase()
    const second = parseInt(combinedMatch[3], 10)

    if (firstUnit === 'h') {
      // 1h30 or 1h30m = hours + minutes
      return {
        kind: 'time',
        seconds: first * 3600 + second * 60,
        raw: token,
      }
    } else {
      // 1m30 or 1'30" = minutes + seconds
      return {
        kind: 'time',
        seconds: first * 60 + second,
        raw: token,
      }
    }
  }

  // Kilometers: 2km, 10km
  const kmMatch = token.match(/^(\d+(?:\.\d+)?)(km)$/i)
  if (kmMatch) {
    return {
      kind: 'distance',
      meters: Math.round(parseFloat(kmMatch[1]) * 1000),
      raw: token,
    }
  }

  // Miles: 1mi, 4.5mi, 1mile
  const miMatch = token.match(/^(\d+(?:\.\d+)?)(mi|mile|miles)$/i)
  if (miMatch) {
    return {
      kind: 'distance',
      meters: Math.round(parseFloat(miMatch[1]) * 1609.344),
      raw: token,
    }
  }

  // Meters: 100mtr, 200meters, 100m (only if followed by non-time suffix)
  const mtrMatch = token.match(/^(\d+)(mtr|meters?|metre)$/i)
  if (mtrMatch) {
    return {
      kind: 'distance',
      meters: parseInt(mtrMatch[1], 10),
      raw: token,
    }
  }

  // Yards: 100yrd, 200yards, 100y
  const yrdMatch = token.match(/^(\d+)(yrd|yards?|y)$/i)
  if (yrdMatch) {
    return {
      kind: 'distance',
      meters: Math.round(parseInt(yrdMatch[1], 10) * 0.9144),
      raw: token,
    }
  }

  return null
}

// ══════════════════════════════════════════════════════════════
// TARGET PARSER
// ══════════════════════════════════════════════════════════════

function parseTarget(
  token: string,
  nextToken?: string
): { target: StepTarget | null; skipNext: boolean } {
  const next = nextToken?.toLowerCase()

  // HR targets: 70% HR, 75-80% HR, Z2 HR
  if (next === 'hr' || next === 'lthr') {
    const basis = next === 'lthr' ? 'lthr' : 'max_hr'

    // Percentage range: 75-80%
    const rangeMatch = token.match(/^(\d+)-(\d+)%$/)
    if (rangeMatch) {
      return {
        target: {
          kind: 'hr',
          basis,
          value: {
            type: 'percent_range',
            minPct: parseInt(rangeMatch[1], 10) / 100,
            maxPct: parseInt(rangeMatch[2], 10) / 100,
          },
        },
        skipNext: true,
      }
    }

    // Single percentage: 70%
    const pctMatch = token.match(/^(\d+)%$/)
    if (pctMatch) {
      return {
        target: {
          kind: 'hr',
          basis,
          value: { type: 'percent', pct: parseInt(pctMatch[1], 10) / 100 },
        },
        skipNext: true,
      }
    }

    // Zone range: Z2-Z3 or Z2-Z2
    const zoneRangeMatch = token.match(/^Z(\d)-Z(\d)$/i)
    if (zoneRangeMatch) {
      const minZone = `Z${zoneRangeMatch[1]}` as HRZone
      const maxZone = `Z${zoneRangeMatch[2]}` as HRZone
      // If same zone, treat as single zone
      if (minZone === maxZone) {
        return {
          target: {
            kind: 'hr',
            basis: 'zone',
            value: { type: 'zone', zone: minZone },
          },
          skipNext: true,
        }
      }
      return {
        target: {
          kind: 'hr',
          basis: 'zone',
          value: { type: 'zone_range', minZone, maxZone },
        },
        skipNext: true,
      }
    }

    // Zone: Z2
    const zoneMatch = token.match(/^Z(\d)$/i)
    if (zoneMatch) {
      return {
        target: {
          kind: 'hr',
          basis: 'zone',
          value: { type: 'zone', zone: `Z${zoneMatch[1]}` as HRZone },
        },
        skipNext: true,
      }
    }
  }

  // Pace targets: 78-82% pace, Z2 Pace, 7:15/km Pace
  if (next === 'pace') {
    // Percentage range: 78-82%
    const rangeMatch = token.match(/^(\d+)-(\d+)%$/)
    if (rangeMatch) {
      return {
        target: {
          kind: 'pace',
          value: {
            type: 'percent_range',
            minPct: parseInt(rangeMatch[1], 10) / 100,
            maxPct: parseInt(rangeMatch[2], 10) / 100,
          },
        },
        skipNext: true,
      }
    }

    // Single percentage: 90%
    const pctMatch = token.match(/^(\d+)%$/)
    if (pctMatch) {
      return {
        target: {
          kind: 'pace',
          value: { type: 'percent', pct: parseInt(pctMatch[1], 10) / 100 },
        },
        skipNext: true,
      }
    }

    // Zone range: Z2-Z3
    const zoneRangeMatch = token.match(/^Z(\d)-Z(\d)$/i)
    if (zoneRangeMatch) {
      const minZone = `Z${zoneRangeMatch[1]}` as PaceZone
      const maxZone = `Z${zoneRangeMatch[2]}` as PaceZone
      // If same zone, treat as single zone
      if (minZone === maxZone) {
        return {
          target: {
            kind: 'pace',
            value: { type: 'zone', zone: minZone },
          },
          skipNext: true,
        }
      }
      return {
        target: {
          kind: 'pace',
          value: { type: 'zone_range', minZone, maxZone },
        },
        skipNext: true,
      }
    }

    // Zone: Z2
    const zoneMatch = token.match(/^Z(\d)$/i)
    if (zoneMatch) {
      return {
        target: {
          kind: 'pace',
          value: { type: 'zone', zone: `Z${zoneMatch[1]}` as PaceZone },
        },
        skipNext: true,
      }
    }

    // Absolute pace range: 7:15-7:00/km
    const absRangeMatch = token.match(/^(\d+:\d+)-(\d+:\d+)(\/\w+)$/)
    if (absRangeMatch) {
      return {
        target: {
          kind: 'pace',
          value: {
            type: 'absolute_range',
            minPace: absRangeMatch[1],
            maxPace: absRangeMatch[2],
            unit: absRangeMatch[3] as PaceUnit,
          },
        },
        skipNext: true,
      }
    }

    // Absolute pace: 7:15/km
    const absMatch = token.match(/^(\d+:\d+)(\/\w+)$/)
    if (absMatch) {
      return {
        target: {
          kind: 'pace',
          value: {
            type: 'absolute',
            pace: absMatch[1],
            unit: absMatch[2] as PaceUnit,
          },
        },
        skipNext: true,
      }
    }
  }

  // Power targets (default when no HR/Pace suffix)
  // Percentage range: 95-105%
  const powerRangeMatch = token.match(/^(\d+)-(\d+)%$/)
  if (powerRangeMatch) {
    return {
      target: {
        kind: 'power',
        value: {
          type: 'percent_range',
          minPct: parseInt(powerRangeMatch[1], 10) / 100,
          maxPct: parseInt(powerRangeMatch[2], 10) / 100,
        },
      },
      skipNext: false,
    }
  }

  // Single percentage: 75%
  const powerPctMatch = token.match(/^(\d+)%$/)
  if (powerPctMatch) {
    return {
      target: {
        kind: 'power',
        value: { type: 'percent', pct: parseInt(powerPctMatch[1], 10) / 100 },
      },
      skipNext: false,
    }
  }

  // Watts range: 200-240w
  const wattsRangeMatch = token.match(/^(\d+)-(\d+)w$/i)
  if (wattsRangeMatch) {
    return {
      target: {
        kind: 'power',
        value: {
          type: 'watts_range',
          minWatts: parseInt(wattsRangeMatch[1], 10),
          maxWatts: parseInt(wattsRangeMatch[2], 10),
        },
      },
      skipNext: false,
    }
  }

  // Absolute watts: 220w
  const wattsMatch = token.match(/^(\d+)w$/i)
  if (wattsMatch) {
    return {
      target: {
        kind: 'power',
        value: { type: 'watts', watts: parseInt(wattsMatch[1], 10) },
      },
      skipNext: false,
    }
  }

  // Zone (defaults to power): Z2, Z4
  const zoneMatch = token.match(/^Z(\d)$/i)
  if (zoneMatch) {
    return {
      target: {
        kind: 'power',
        value: { type: 'zone', zone: `Z${zoneMatch[1]}` as PowerZone },
      },
      skipNext: false,
    }
  }

  return { target: null, skipNext: false }
}

// ══════════════════════════════════════════════════════════════
// DURATION CALCULATION
// ══════════════════════════════════════════════════════════════

/**
 * Calculate total workout duration in seconds.
 * Handles section repeats and step repeats.
 */
export function calculateDuration(structure: WorkoutStructure): number {
  let total = 0

  for (const section of structure.sections) {
    let sectionDuration = 0

    for (const step of section.steps) {
      let stepDuration = getStepDurationSeconds(step)

      // Apply step repeat
      if (step.repeat) {
        stepDuration *= step.repeat.times
      }

      sectionDuration += stepDuration
    }

    // Apply section repeat
    const repeatTimes = section.repeat?.times ?? 1
    total += sectionDuration * repeatTimes
  }

  return total
}

function getStepDurationSeconds(step: WorkoutStep): number {
  if (step.duration.kind === 'time') {
    return step.duration.seconds
  }

  // For distance-based steps, we can't calculate duration without pace
  // Return 0 for now - metrics calculation will handle this
  return 0
}

// ══════════════════════════════════════════════════════════════
// METRICS CALCULATION
// ══════════════════════════════════════════════════════════════

/**
 * Calculate workout metrics using athlete zones.
 */
function calculateMetrics(
  structure: WorkoutStructure,
  sportZones: SportZones,
  durationSeconds: number
): StructuredWorkout['metrics'] {
  if (durationSeconds === 0) {
    return {}
  }

  const stepIntensities = collectStepIntensities(structure, sportZones)

  if (stepIntensities.length === 0) {
    return {}
  }

  // Weighted average intensity
  let weightedSum = 0
  let totalSeconds = 0
  let fourthPowerSum = 0

  for (const { seconds, intensity } of stepIntensities) {
    if (intensity !== null) {
      weightedSum += seconds * intensity
      fourthPowerSum += seconds * Math.pow(intensity, 4)
      totalSeconds += seconds
    }
  }

  if (totalSeconds === 0) {
    return {}
  }

  const avgIntensity = weightedSum / totalSeconds

  // Normalized intensity (4th power average)
  const normalizedIntensity = Math.pow(fourthPowerSum / totalSeconds, 0.25)

  // IF = normalizedIntensity (by definition in our model)
  const intensityFactor = normalizedIntensity

  // TSS = (hours x IF^2) x 100
  const hours = durationSeconds / 3600
  const estimatedTSS = hours * Math.pow(intensityFactor, 2) * 100

  // Estimated distance for pace-based workouts (Run, Swim)
  // distance = threshold_speed (m/s) × avgIntensity × duration (s)
  const estimatedDistanceMeters = sportZones.pace?.threshold
    ? sportZones.pace.threshold * avgIntensity * durationSeconds
    : undefined

  return {
    avgIntensity,
    normalizedIntensity,
    intensityFactor,
    estimatedTSS,
    estimatedDistanceMeters,
  }
}

interface StepIntensity {
  seconds: number
  intensity: number | null // null for freeride or unknown
}

function collectStepIntensities(
  structure: WorkoutStructure,
  sportZones: SportZones
): StepIntensity[] {
  const result: StepIntensity[] = []

  for (const section of structure.sections) {
    const repeatTimes = section.repeat?.times ?? 1

    for (let r = 0; r < repeatTimes; r++) {
      for (const step of section.steps) {
        const stepRepeat = step.repeat?.times ?? 1
        const seconds = getStepDurationSeconds(step) * stepRepeat
        const intensity = getStepIntensity(step, sportZones)

        // Handle ramps by splitting into start and end
        if (step.ramp && seconds > 0) {
          const halfSeconds = seconds / 2
          result.push({ seconds: halfSeconds, intensity: step.ramp.fromPct })
          result.push({ seconds: halfSeconds, intensity: step.ramp.toPct })
        } else {
          result.push({ seconds, intensity })
        }
      }
    }
  }

  return result
}

function getStepIntensity(step: WorkoutStep, sportZones: SportZones): number | null {
  if (!step.target) return null
  if (step.target.kind === 'freeride') return null

  switch (step.target.kind) {
    case 'power':
      return getPowerIntensity(step.target.value, sportZones)
    case 'hr':
      return getHRIntensity(step.target.value, sportZones)
    case 'pace':
      return getPaceIntensity(step.target.value, sportZones)
  }
}

function getPowerIntensity(value: PowerValue, sportZones: SportZones): number | null {
  const ftp = sportZones.power?.ftp
  if (!ftp) return null

  switch (value.type) {
    case 'percent':
      return value.pct
    case 'percent_range':
      return (value.minPct + value.maxPct) / 2
    case 'watts':
      return value.watts / ftp
    case 'watts_range':
      return (value.minWatts + value.maxWatts) / 2 / ftp
    case 'zone':
      return getZoneMidpoint(value.zone, sportZones.power?.boundaries)
  }
}

function getHRIntensity(value: HRValue, sportZones: SportZones): number | null {
  // HR intensity is already relative to threshold (LTHR or max HR)
  switch (value.type) {
    case 'percent':
      return value.pct
    case 'percent_range':
      return (value.minPct + value.maxPct) / 2
    case 'zone':
      return getZoneMidpoint(value.zone, sportZones.hr?.boundaries)
    case 'zone_range': {
      const minMid = getZoneMidpoint(value.minZone, sportZones.hr?.boundaries)
      const maxMid = getZoneMidpoint(value.maxZone, sportZones.hr?.boundaries)
      if (minMid === null || maxMid === null) return null
      return (minMid + maxMid) / 2
    }
  }
}

function getPaceIntensity(value: PaceValue, sportZones: SportZones): number | null {
  // Pace intensity: higher % = faster = higher intensity
  switch (value.type) {
    case 'percent':
      return value.pct
    case 'percent_range':
      return (value.minPct + value.maxPct) / 2
    case 'zone':
      return getZoneMidpoint(value.zone, sportZones.pace?.boundaries)
    case 'zone_range': {
      const minMid = getZoneMidpoint(value.minZone, sportZones.pace?.boundaries)
      const maxMid = getZoneMidpoint(value.maxZone, sportZones.pace?.boundaries)
      if (minMid === null || maxMid === null) return null
      return (minMid + maxMid) / 2
    }
    case 'absolute':
    case 'absolute_range':
      // Would need threshold pace to calculate - return null for now
      return null
  }
}

/**
 * Get zone midpoint as decimal intensity.
 * Boundaries are upper limits as % of threshold.
 */
function getZoneMidpoint(
  zone: PowerZone | HRZone | PaceZone,
  boundaries?: number[]
): number | null {
  if (!boundaries || boundaries.length < 7) {
    // Use default zone midpoints if no custom boundaries
    const defaults: Record<string, number> = {
      Z1: 0.50, // 0-55% -> midpoint ~50%
      Z2: 0.65, // 56-75% -> midpoint ~65%
      Z3: 0.83, // 76-90% -> midpoint ~83%
      Z4: 0.98, // 91-105% -> midpoint ~98%
      Z5: 1.13, // 106-120% -> midpoint ~113%
      Z6: 1.35, // 121-150% -> midpoint ~135%
      Z7: 1.60, // >150% -> ~160%
    }
    return defaults[zone] ?? null
  }

  const zoneNum = parseInt(zone.slice(1), 10)
  const upper = boundaries[zoneNum - 1] ?? 100
  const lower = zoneNum > 1 ? boundaries[zoneNum - 2] : 0

  // Convert from % to decimal
  return ((lower + upper) / 2) / 100
}
