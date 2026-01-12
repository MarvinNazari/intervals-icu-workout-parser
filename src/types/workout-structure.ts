/**
 * Workout Structure (AST)
 *
 * TypeScript representation of the Intervals.icu workout text format.
 * This is the parsed AST - the structure of sections, steps, and targets.
 */

/**
 * Parsed workout structure (AST).
 * Single exported model, everything else is nested unions.
 */
export interface WorkoutStructure {
  /** Optional header block before the first step/section. */
  header?: {
    title?: string
    descriptionLines?: string[]
    category?: string // "Category: ..."
  }

  /** Workout content grouped into sections. */
  sections: WorkoutSection[]

  /** Non-fatal parse issues (unknown tokens, ignored fragments) */
  parseNotes?: string[]
}

export interface WorkoutSection {
  title?: string

  /**
   * Section repeat like "Main set 6x" or a standalone "6x" line.
   * Nested repeats are not officially supported.
   */
  repeat?: {
    times: number
    isStandalone?: boolean
  }

  steps: WorkoutStep[]
}

export interface WorkoutStep {
  /** Free text at the start of a line, before duration/intensity tokens. */
  label?: string

  /** Duration token */
  duration: StepDuration

  /**
   * Target/intensity token(s)
   * - power: watts, %, zone, ranges
   * - hr: %max, %lthr, zone
   * - pace: absolute (mm:ss/unit), %, zone, ranges
   * - freeride: ERG off
   */
  target?: StepTarget

  /** Optional cadence token after intensity */
  cadence?: { rpm: number } | { rangeRpm: { min: number; max: number } }

  /** Optional ramp modifier (commonly % ramps) */
  ramp?: { fromPct: number; toPct: number }

  /** Optional swim-style rest "20s rest" */
  restAfter?: { seconds: number }

  /** Timed text prompts like "60^30 ..." and "<!>" splits */
  prompts?: StepPrompt[]

  /** Misc flags/tokens */
  flags?: StepFlag[]

  /** Optional step repeat marker for inline repeats like "4x 30s ..." */
  repeat?: { times: number }
}

// ══════════════════════════════════════════════════════════════
// DURATION
// ══════════════════════════════════════════════════════════════

export type StepDuration =
  | { kind: 'time'; seconds: number; raw?: string }
  | { kind: 'distance'; meters: number; raw?: string }
  | { kind: 'lap_press' }

// ══════════════════════════════════════════════════════════════
// TARGET
// ══════════════════════════════════════════════════════════════

export type StepTarget =
  | { kind: 'freeride' }
  | { kind: 'power'; value: PowerValue }
  | { kind: 'hr'; basis: 'max_hr' | 'lthr' | 'zone'; value: HRValue }
  | { kind: 'pace'; value: PaceValue }

export type PowerValue =
  | { type: 'percent'; pct: number }
  | { type: 'percent_range'; minPct: number; maxPct: number }
  | { type: 'watts'; watts: number }
  | { type: 'watts_range'; minWatts: number; maxWatts: number }
  | { type: 'zone'; zone: PowerZone }

export type HRValue =
  | { type: 'percent'; pct: number }
  | { type: 'percent_range'; minPct: number; maxPct: number }
  | { type: 'zone'; zone: HRZone }
  | { type: 'zone_range'; minZone: HRZone; maxZone: HRZone }

export type PaceValue =
  | { type: 'percent'; pct: number }
  | { type: 'percent_range'; minPct: number; maxPct: number }
  | { type: 'zone'; zone: PaceZone }
  | { type: 'zone_range'; minZone: PaceZone; maxZone: PaceZone }
  | { type: 'absolute'; pace: string; unit: PaceUnit }
  | { type: 'absolute_range'; minPace: string; maxPace: string; unit: PaceUnit }

export type PowerZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7'
export type HRZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7'
export type PaceZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7'

export type PaceUnit =
  | '/km'
  | '/mi'
  | '/100m'
  | '/100y'
  | '/500m'
  | '/400m'
  | '/250m'

// ══════════════════════════════════════════════════════════════
// PROMPTS & FLAGS
// ══════════════════════════════════════════════════════════════

export interface StepPrompt {
  atSeconds: number
  forSeconds?: number
  text: string
}

export type StepFlag =
  | { kind: 'hidepower'; enabled: boolean }
  | { kind: 'press_lap' }
  | { kind: 'intensity_override'; value: IntensityOverride }

export type IntensityOverride =
  | 'active'
  | 'recovery'
  | 'interval'
  | 'warmup'
  | 'cooldown'
  | 'rest'
  | 'other'
  | 'auto'
