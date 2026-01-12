/**
 * Structured Workout
 *
 * The result of parsing a workout text with athlete zones.
 * Contains the AST structure plus calculated duration and metrics.
 */

import type { WorkoutStructure } from './workout-structure'

/**
 * Parsed workout with structure and calculated metrics.
 */
export interface StructuredWorkout {
  /** Parsed workout structure (AST) */
  structure: WorkoutStructure

  /** Total duration in seconds (calculated from steps, includes repeats) */
  durationSeconds: number

  /** Calculated metrics (requires athlete zones) */
  metrics: {
    /** Weighted average intensity as % of threshold (0-1+) */
    avgIntensity?: number

    /** Normalized intensity - NP-equivalent, accounts for interval stress (4th power avg) */
    normalizedIntensity?: number

    /** Intensity Factor = normalizedIntensity */
    intensityFactor?: number

    /** Estimated TSS = (hours × IF²) × 100 */
    estimatedTSS?: number

    /** Estimated distance in meters (only for pace-based workouts like Run/Swim) */
    estimatedDistanceMeters?: number
  }
}
