---
title: Parsing API
description: API reference for parsing Intervals.icu workouts
---

## parseWorkoutStructure

Parse workout text into a structured AST without calculating metrics.

```typescript
function parseWorkoutStructure(text: string): WorkoutStructure
```

### Parameters

- `text` - The Intervals.icu workout text to parse

### Returns

A `WorkoutStructure` object containing:

- `header` - Optional title, description, and category
- `sections` - Array of workout sections with steps
- `parseNotes` - Any non-fatal parsing warnings

### Example

```typescript
import { parseWorkoutStructure } from 'intervals-icu-workout-parser'

const structure = parseWorkoutStructure(`
Sweet Spot

Warmup
- 10m 60%

Main Set 3x
- 8m 88-94%
- 4m 55%
`)

console.log(structure.header?.title) // "Sweet Spot"
console.log(structure.sections.length) // 2
console.log(structure.sections[1].repeat?.times) // 3
```

---

## parseWorkout

Parse workout text with athlete zones to get duration and training metrics.

```typescript
function parseWorkout(text: string, zones: SportZones): StructuredWorkout
```

### Parameters

- `text` - The Intervals.icu workout text to parse
- `zones` - Athlete training zones for metric calculation

### Returns

A `StructuredWorkout` object containing:

- `structure` - The parsed AST
- `durationSeconds` - Total workout duration in seconds
- `metrics` - Calculated training metrics

### Example

```typescript
import { parseWorkout } from 'intervals-icu-workout-parser'

const workout = parseWorkout(workoutText, {
  loadPreference: ['power', 'hr'],
  power: {
    ftp: 250,
    boundaries: [55, 75, 90, 105, 120, 150, 999],
  },
  hr: {
    lthr: 165,
    maxHr: 185,
    boundaries: [152, 161, 170, 179, 184, 189, 201],
  },
})

console.log(workout.durationSeconds) // 2640
console.log(workout.metrics.estimatedTSS) // ~52
console.log(workout.metrics.intensityFactor) // ~0.84
console.log(workout.metrics.avgIntensity) // ~0.76
```

### Metrics

When zones are provided, the following metrics are calculated:

| Metric | Description |
|--------|-------------|
| `avgIntensity` | Weighted average intensity (0-1+) |
| `normalizedIntensity` | 4th power average (NP-style) |
| `intensityFactor` | Same as normalizedIntensity |
| `estimatedTSS` | Estimated Training Stress Score |
| `estimatedDistanceMeters` | For pace-based workouts only |

---

## calculateDuration

Calculate total workout duration from a parsed structure.

```typescript
function calculateDuration(structure: WorkoutStructure): number
```

### Parameters

- `structure` - A parsed `WorkoutStructure`

### Returns

Total duration in seconds, accounting for section and step repeats.

### Example

```typescript
import { parseWorkoutStructure, calculateDuration } from 'intervals-icu-workout-parser'

const structure = parseWorkoutStructure(`
Main Set 4x
- 3m 90%
- 2m 50%
`)

const duration = calculateDuration(structure)
console.log(duration) // 1200 (4 × 5 minutes = 20 minutes)
```

---

## SportZones

The zones object structure for metric calculation:

```typescript
interface SportZones {
  loadPreference: ('power' | 'hr' | 'pace')[]

  power?: {
    ftp: number           // Functional Threshold Power
    indoorFtp?: number    // Indoor FTP if different
    boundaries?: number[] // Zone boundaries as % of FTP
  }

  hr?: {
    lthr: number          // Lactate Threshold HR
    maxHr?: number        // Max HR
    boundaries?: number[] // Zone boundaries in bpm
  }

  pace?: {
    threshold: number     // Threshold speed in m/s
    unit: 'mins_km' | 'mins_mile' | 'secs_100m' | 'secs_100y' | 'secs_500m'
    boundaries?: number[] // Zone boundaries as % of threshold
  }
}
```

### Zone Boundaries

Boundaries are arrays of 7 values representing the upper limit of each zone:

```typescript
// Example power zones (% of FTP)
boundaries: [55, 75, 90, 105, 120, 150, 999]
// Z1: 0-55%, Z2: 56-75%, Z3: 76-90%, etc.

// Example HR zones (absolute bpm)
boundaries: [152, 161, 170, 179, 184, 189, 201]
// Z1: 0-152, Z2: 153-161, Z3: 162-170, etc.
```
