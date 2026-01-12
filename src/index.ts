/**
 * Intervals.icu Workout Parser
 *
 * Parse and build Intervals.icu workout text format.
 */

// Parser
export { parseWorkout, parseWorkoutStructure, calculateDuration } from './parser'

// Builder
export { WorkoutBuilder, SectionBuilder, StepBuilder, serializeWorkout } from './builder'

// Types
export type {
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

export type { StructuredWorkout } from './types/structured-workout'

export type { SportZones } from './types/zones'
