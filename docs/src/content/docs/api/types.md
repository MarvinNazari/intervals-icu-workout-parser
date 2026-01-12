---
title: Types Reference
description: TypeScript type definitions for intervals-icu-workout-parser
---

All types are exported from the main package:

```typescript
import type {
  WorkoutStructure,
  WorkoutSection,
  WorkoutStep,
  // ... etc
} from 'intervals-icu-workout-parser'
```

## WorkoutStructure

The root AST type representing a parsed workout.

```typescript
interface WorkoutStructure {
  header?: {
    title?: string
    descriptionLines?: string[]
    category?: string
  }
  sections: WorkoutSection[]
  parseNotes?: string[]
}
```

## WorkoutSection

A section of the workout (e.g., "Warmup", "Main Set").

```typescript
interface WorkoutSection {
  title?: string
  repeat?: {
    times: number
    isStandalone?: boolean  // true for "6x" without title
  }
  steps: WorkoutStep[]
}
```

## WorkoutStep

An individual step within a section.

```typescript
interface WorkoutStep {
  label?: string
  duration: StepDuration
  target?: StepTarget
  cadence?: { rpm: number } | { rangeRpm: { min: number; max: number } }
  ramp?: { fromPct: number; toPct: number }
  restAfter?: { seconds: number }
  prompts?: StepPrompt[]
  flags?: StepFlag[]
  repeat?: { times: number }
}
```

## StepDuration

Duration can be time-based or distance-based.

```typescript
type StepDuration =
  | { kind: 'time'; seconds: number; raw?: string }
  | { kind: 'distance'; meters: number; raw?: string }
  | { kind: 'lap_press' }
```

## StepTarget

The intensity target for a step.

```typescript
type StepTarget =
  | { kind: 'freeride' }
  | { kind: 'power'; value: PowerValue }
  | { kind: 'hr'; basis: 'max_hr' | 'lthr' | 'zone'; value: HRValue }
  | { kind: 'pace'; value: PaceValue }
```

## PowerValue

```typescript
type PowerValue =
  | { type: 'percent'; pct: number }
  | { type: 'percent_range'; minPct: number; maxPct: number }
  | { type: 'watts'; watts: number }
  | { type: 'watts_range'; minWatts: number; maxWatts: number }
  | { type: 'zone'; zone: PowerZone }
```

## HRValue

```typescript
type HRValue =
  | { type: 'percent'; pct: number }
  | { type: 'percent_range'; minPct: number; maxPct: number }
  | { type: 'zone'; zone: HRZone }
  | { type: 'zone_range'; minZone: HRZone; maxZone: HRZone }
```

## PaceValue

```typescript
type PaceValue =
  | { type: 'percent'; pct: number }
  | { type: 'percent_range'; minPct: number; maxPct: number }
  | { type: 'zone'; zone: PaceZone }
  | { type: 'zone_range'; minZone: PaceZone; maxZone: PaceZone }
  | { type: 'absolute'; pace: string; unit: PaceUnit }
  | { type: 'absolute_range'; minPace: string; maxPace: string; unit: PaceUnit }
```

## Zone Types

```typescript
type PowerZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7'
type HRZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7'
type PaceZone = 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5' | 'Z6' | 'Z7'
```

## PaceUnit

```typescript
type PaceUnit =
  | '/km'
  | '/mi'
  | '/100m'
  | '/100y'
  | '/500m'
  | '/400m'
  | '/250m'
```

## StructuredWorkout

Result of parsing with athlete zones.

```typescript
interface StructuredWorkout {
  structure: WorkoutStructure
  durationSeconds: number
  metrics: {
    avgIntensity?: number
    normalizedIntensity?: number
    intensityFactor?: number
    estimatedTSS?: number
    estimatedDistanceMeters?: number
  }
}
```

## SportZones

Athlete training zones for metric calculation.

```typescript
interface SportZones {
  loadPreference: ('power' | 'hr' | 'pace')[]

  power?: {
    ftp: number
    indoorFtp?: number
    boundaries?: number[]
    names?: string[]
    sweetSpotMin?: number
    sweetSpotMax?: number
  }

  hr?: {
    lthr: number
    maxHr?: number
    boundaries?: number[]
    names?: string[]
  }

  pace?: {
    threshold: number
    unit: 'mins_km' | 'mins_mile' | 'secs_100m' | 'secs_100y' | 'secs_500m'
    boundaries?: number[]
    names?: string[]
  }
}
```
