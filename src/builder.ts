/**
 * Workout Builder
 *
 * Fluent API for building Intervals.icu workouts programmatically.
 * Also includes serializer to convert AST back to text format.
 */

import type {
  WorkoutStructure,
  WorkoutSection,
  WorkoutStep,
  StepDuration,
  StepTarget,
  PowerZone,
  HRZone,
  PaceZone,
  PaceUnit,
} from './types/workout-structure'

// ══════════════════════════════════════════════════════════════
// SERIALIZER
// ══════════════════════════════════════════════════════════════

/**
 * Serialize a WorkoutStructure AST to Intervals.icu text format.
 */
export function serializeWorkout(structure: WorkoutStructure): string {
  const lines: string[] = []

  // Header
  if (structure.header?.title) {
    lines.push(structure.header.title)
    lines.push('')
  }

  if (structure.header?.descriptionLines) {
    lines.push(...structure.header.descriptionLines)
    lines.push('')
  }

  if (structure.header?.category) {
    lines.push(`Category: ${structure.header.category}`)
    lines.push('')
  }

  // Sections
  for (const section of structure.sections) {
    // Section header
    if (section.title || section.repeat) {
      if (section.repeat?.isStandalone) {
        lines.push(`${section.repeat.times}x`)
      } else if (section.title && section.repeat) {
        lines.push(`${section.title} ${section.repeat.times}x`)
      } else if (section.title) {
        lines.push(section.title)
      }
    }

    // Steps
    for (const step of section.steps) {
      lines.push(`- ${serializeStep(step)}`)
    }

    lines.push('')
  }

  // Remove trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  return lines.join('\n')
}

function serializeStep(step: WorkoutStep): string {
  const parts: string[] = []

  // Step repeat
  if (step.repeat) {
    parts.push(`${step.repeat.times}x`)
  }

  // Label
  if (step.label) {
    parts.push(step.label)
  }

  // Duration
  parts.push(serializeDuration(step.duration))

  // Target
  if (step.target) {
    parts.push(serializeTarget(step.target))
  }

  // Ramp
  if (step.ramp) {
    parts.push(`ramp ${Math.round(step.ramp.fromPct * 100)}-${Math.round(step.ramp.toPct * 100)}%`)
  }

  // Cadence
  if (step.cadence) {
    if ('rpm' in step.cadence) {
      parts.push(`${step.cadence.rpm}rpm`)
    } else {
      parts.push(`${step.cadence.rangeRpm.min}-${step.cadence.rangeRpm.max}rpm`)
    }
  }

  return parts.join(' ')
}

function serializeDuration(duration: StepDuration): string {
  // Use raw value if available (time and distance types only)
  if (duration.kind !== 'lap_press' && duration.raw) {
    return duration.raw
  }

  switch (duration.kind) {
    case 'time': {
      const seconds = duration.seconds
      if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        if (mins > 0) {
          return `${hours}h${mins}m`
        }
        return `${hours}h`
      }
      if (seconds >= 60) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        if (secs > 0) {
          return `${mins}m${secs}s`
        }
        return `${mins}m`
      }
      return `${seconds}s`
    }
    case 'distance': {
      const meters = duration.meters
      if (meters >= 1000) {
        return `${meters / 1000}km`
      }
      return `${meters}m`
    }
    case 'lap_press':
      return 'lap'
  }
}

function serializeTarget(target: StepTarget): string {
  switch (target.kind) {
    case 'freeride':
      return 'freeride'

    case 'power': {
      const value = target.value
      switch (value.type) {
        case 'percent':
          return `${Math.round(value.pct * 100)}%`
        case 'percent_range':
          return `${Math.round(value.minPct * 100)}-${Math.round(value.maxPct * 100)}%`
        case 'watts':
          return `${value.watts}w`
        case 'watts_range':
          return `${value.minWatts}-${value.maxWatts}w`
        case 'zone':
          return value.zone
      }
      break
    }

    case 'hr': {
      const value = target.value
      const suffix = target.basis === 'lthr' ? 'LTHR' : 'HR'
      switch (value.type) {
        case 'percent':
          return `${Math.round(value.pct * 100)}% ${suffix}`
        case 'percent_range':
          return `${Math.round(value.minPct * 100)}-${Math.round(value.maxPct * 100)}% ${suffix}`
        case 'zone':
          return `${value.zone} HR`
        case 'zone_range':
          return `${value.minZone}-${value.maxZone} HR`
      }
      break
    }

    case 'pace': {
      const value = target.value
      switch (value.type) {
        case 'percent':
          return `${Math.round(value.pct * 100)}% pace`
        case 'percent_range':
          return `${Math.round(value.minPct * 100)}-${Math.round(value.maxPct * 100)}% pace`
        case 'zone':
          return `${value.zone} pace`
        case 'zone_range':
          return `${value.minZone}-${value.maxZone} pace`
        case 'absolute':
          return `${value.pace}${value.unit} pace`
        case 'absolute_range':
          return `${value.minPace}-${value.maxPace}${value.unit} pace`
      }
      break
    }
  }

  return ''
}

// ══════════════════════════════════════════════════════════════
// WORKOUT BUILDER
// ══════════════════════════════════════════════════════════════

/**
 * Fluent builder for creating workouts programmatically.
 *
 * @example
 * ```ts
 * const workout = new WorkoutBuilder()
 *   .title('Tempo Run')
 *   .section('Warm Up')
 *     .step().time(10).hrZone('Z2').add()
 *   .section('Main Set').repeat(3)
 *     .step().time(10).pacePercent(90).add()
 *     .step().time(5).hrZone('Z2').add()
 *   .section('Cool Down')
 *     .step().time(10).hrZone('Z1').add()
 *   .build()
 * ```
 */
export class WorkoutBuilder {
  private _title?: string
  private _description?: string[]
  private _category?: string
  private _sections: WorkoutSection[] = []
  private _currentSectionBuilder?: SectionBuilder

  /**
   * Set the workout title.
   */
  title(name: string): this {
    this._title = name
    return this
  }

  /**
   * Add description lines.
   */
  description(...lines: string[]): this {
    this._description = lines
    return this
  }

  /**
   * Set the workout category.
   */
  category(cat: string): this {
    this._category = cat
    return this
  }

  /**
   * Start a new section.
   */
  section(name?: string): SectionBuilder {
    // Finalize previous section if exists
    if (this._currentSectionBuilder) {
      this._sections.push(this._currentSectionBuilder.build())
    }

    this._currentSectionBuilder = new SectionBuilder(this, name)
    return this._currentSectionBuilder
  }

  /**
   * Build the final WorkoutStructure.
   */
  build(): WorkoutStructure {
    // Finalize current section
    if (this._currentSectionBuilder) {
      this._sections.push(this._currentSectionBuilder.build())
    }

    const structure: WorkoutStructure = {
      sections: this._sections,
    }

    if (this._title || this._description || this._category) {
      structure.header = {}
      if (this._title) structure.header.title = this._title
      if (this._description) structure.header.descriptionLines = this._description
      if (this._category) structure.header.category = this._category
    }

    return structure
  }

  /**
   * Build and serialize to Intervals.icu text format.
   */
  toString(): string {
    return serializeWorkout(this.build())
  }
}

// ══════════════════════════════════════════════════════════════
// SECTION BUILDER
// ══════════════════════════════════════════════════════════════

/**
 * Builder for workout sections.
 */
export class SectionBuilder {
  private _title?: string
  private _repeat?: { times: number; isStandalone?: boolean }
  private _steps: WorkoutStep[] = []
  private _parent: WorkoutBuilder

  constructor(parent: WorkoutBuilder, title?: string) {
    this._parent = parent
    this._title = title
  }

  /**
   * Set section repeat count.
   */
  repeat(times: number): this {
    this._repeat = { times }
    return this
  }

  /**
   * Start building a new step.
   */
  step(): StepBuilder {
    return new StepBuilder(this)
  }

  /**
   * Add a completed step to this section.
   * @internal
   */
  addStep(step: WorkoutStep): this {
    this._steps.push(step)
    return this
  }

  /**
   * Start a new section (finalizes this one).
   */
  section(name?: string): SectionBuilder {
    return this._parent.section(name)
  }

  /**
   * Build the workout (finalizes this section).
   */
  build(): WorkoutSection {
    return {
      title: this._title,
      repeat: this._repeat,
      steps: this._steps,
    }
  }

  /**
   * Build the full workout structure.
   */
  buildWorkout(): WorkoutStructure {
    return this._parent.build()
  }

  /**
   * Serialize the full workout to text.
   */
  toString(): string {
    return this._parent.toString()
  }
}

// ══════════════════════════════════════════════════════════════
// STEP BUILDER
// ══════════════════════════════════════════════════════════════

/**
 * Builder for individual workout steps.
 */
export class StepBuilder {
  private _duration?: StepDuration
  private _target?: StepTarget
  private _cadence?: WorkoutStep['cadence']
  private _ramp?: WorkoutStep['ramp']
  private _label?: string
  private _repeat?: { times: number }
  private _parent: SectionBuilder

  constructor(parent: SectionBuilder) {
    this._parent = parent
  }

  // Duration methods

  /**
   * Set duration in minutes.
   */
  time(minutes: number): this {
    this._duration = { kind: 'time', seconds: minutes * 60 }
    return this
  }

  /**
   * Set duration in seconds.
   */
  seconds(secs: number): this {
    this._duration = { kind: 'time', seconds: secs }
    return this
  }

  /**
   * Set duration in hours.
   */
  hours(hrs: number): this {
    this._duration = { kind: 'time', seconds: hrs * 3600 }
    return this
  }

  /**
   * Set distance in meters.
   */
  distance(meters: number): this {
    this._duration = { kind: 'distance', meters }
    return this
  }

  /**
   * Set distance in kilometers.
   */
  km(kilometers: number): this {
    this._duration = { kind: 'distance', meters: kilometers * 1000 }
    return this
  }

  /**
   * Set distance in miles.
   */
  miles(mi: number): this {
    this._duration = { kind: 'distance', meters: Math.round(mi * 1609.344) }
    return this
  }

  // Power targets

  /**
   * Set power target as percentage of FTP.
   */
  power(percent: number): this {
    this._target = { kind: 'power', value: { type: 'percent', pct: percent / 100 } }
    return this
  }

  /**
   * Set power target as percentage range.
   */
  powerRange(min: number, max: number): this {
    this._target = {
      kind: 'power',
      value: { type: 'percent_range', minPct: min / 100, maxPct: max / 100 },
    }
    return this
  }

  /**
   * Set power target in watts.
   */
  watts(w: number): this {
    this._target = { kind: 'power', value: { type: 'watts', watts: w } }
    return this
  }

  /**
   * Set power target as watts range.
   */
  wattsRange(min: number, max: number): this {
    this._target = {
      kind: 'power',
      value: { type: 'watts_range', minWatts: min, maxWatts: max },
    }
    return this
  }

  /**
   * Set power zone target.
   */
  powerZone(zone: PowerZone): this {
    this._target = { kind: 'power', value: { type: 'zone', zone } }
    return this
  }

  // HR targets

  /**
   * Set HR target as percentage of max HR.
   */
  hr(percent: number): this {
    this._target = {
      kind: 'hr',
      basis: 'max_hr',
      value: { type: 'percent', pct: percent / 100 },
    }
    return this
  }

  /**
   * Set HR target as percentage range of max HR.
   */
  hrRange(min: number, max: number): this {
    this._target = {
      kind: 'hr',
      basis: 'max_hr',
      value: { type: 'percent_range', minPct: min / 100, maxPct: max / 100 },
    }
    return this
  }

  /**
   * Set HR target as percentage of LTHR.
   */
  lthr(percent: number): this {
    this._target = {
      kind: 'hr',
      basis: 'lthr',
      value: { type: 'percent', pct: percent / 100 },
    }
    return this
  }

  /**
   * Set HR target as percentage range of LTHR.
   */
  lthrRange(min: number, max: number): this {
    this._target = {
      kind: 'hr',
      basis: 'lthr',
      value: { type: 'percent_range', minPct: min / 100, maxPct: max / 100 },
    }
    return this
  }

  /**
   * Set HR zone target.
   */
  hrZone(zone: HRZone): this {
    this._target = { kind: 'hr', basis: 'zone', value: { type: 'zone', zone } }
    return this
  }

  /**
   * Set HR zone range target.
   */
  hrZoneRange(min: HRZone, max: HRZone): this {
    this._target = {
      kind: 'hr',
      basis: 'zone',
      value: { type: 'zone_range', minZone: min, maxZone: max },
    }
    return this
  }

  // Pace targets

  /**
   * Set pace target as percentage.
   */
  pacePercent(percent: number): this {
    this._target = { kind: 'pace', value: { type: 'percent', pct: percent / 100 } }
    return this
  }

  /**
   * Set pace target as percentage range.
   */
  pacePercentRange(min: number, max: number): this {
    this._target = {
      kind: 'pace',
      value: { type: 'percent_range', minPct: min / 100, maxPct: max / 100 },
    }
    return this
  }

  /**
   * Set pace zone target.
   */
  paceZone(zone: PaceZone): this {
    this._target = { kind: 'pace', value: { type: 'zone', zone } }
    return this
  }

  /**
   * Set pace zone range target.
   */
  paceZoneRange(min: PaceZone, max: PaceZone): this {
    this._target = {
      kind: 'pace',
      value: { type: 'zone_range', minZone: min, maxZone: max },
    }
    return this
  }

  /**
   * Set absolute pace target.
   */
  pace(value: string, unit: PaceUnit): this {
    this._target = { kind: 'pace', value: { type: 'absolute', pace: value, unit } }
    return this
  }

  /**
   * Set absolute pace range target.
   */
  paceRange(min: string, max: string, unit: PaceUnit): this {
    this._target = {
      kind: 'pace',
      value: { type: 'absolute_range', minPace: min, maxPace: max, unit },
    }
    return this
  }

  /**
   * Set freeride (no target).
   */
  freeride(): this {
    this._target = { kind: 'freeride' }
    return this
  }

  // Other step properties

  /**
   * Set cadence in RPM.
   */
  cadence(rpm: number): this {
    this._cadence = { rpm }
    return this
  }

  /**
   * Set cadence range in RPM.
   */
  cadenceRange(min: number, max: number): this {
    this._cadence = { rangeRpm: { min, max } }
    return this
  }

  /**
   * Set ramp from one intensity to another.
   */
  ramp(fromPercent: number, toPercent: number): this {
    this._ramp = { fromPct: fromPercent / 100, toPct: toPercent / 100 }
    return this
  }

  /**
   * Set step label.
   */
  label(text: string): this {
    this._label = text
    return this
  }

  /**
   * Set step repeat count.
   */
  repeat(times: number): this {
    this._repeat = { times }
    return this
  }

  /**
   * Finalize and add this step to the section.
   */
  add(): SectionBuilder {
    const step: WorkoutStep = {
      duration: this._duration ?? { kind: 'time', seconds: 0 },
    }

    if (this._label) step.label = this._label
    if (this._target) step.target = this._target
    if (this._cadence) step.cadence = this._cadence
    if (this._ramp) step.ramp = this._ramp
    if (this._repeat) step.repeat = this._repeat

    return this._parent.addStep(step)
  }
}
