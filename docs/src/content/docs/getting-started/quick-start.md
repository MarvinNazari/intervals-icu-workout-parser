---
title: Quick Start
description: Get started with intervals-icu-workout-parser in 5 minutes
---

## Parsing a Workout

The simplest way to use the library is to parse workout text into a structured format:

```typescript
import { parseWorkoutStructure } from 'intervals-icu-workout-parser'

const structure = parseWorkoutStructure(`
Tempo Run

Warm Up
- 10m Z2 HR

Main Set 3x
- 10m 85-90% pace
- 5m Z2 HR

Cool Down
- 10m Z1 HR
`)

// Access the parsed structure
console.log(structure.header?.title) // "Tempo Run"
console.log(structure.sections.length) // 3

// Iterate through sections
for (const section of structure.sections) {
  console.log(section.title, section.repeat?.times ?? 1, 'x')
  for (const step of section.steps) {
    console.log('  -', step.duration, step.target)
  }
}
```

## Calculating Duration

```typescript
import { parseWorkoutStructure, calculateDuration } from 'intervals-icu-workout-parser'

const structure = parseWorkoutStructure(`
Main Set 4x
- 3m 90%
- 2m 50%
`)

const durationSeconds = calculateDuration(structure)
console.log(durationSeconds) // 1200 (20 minutes)
```

## Parsing with Metrics

If you have athlete zones, you can calculate training metrics:

```typescript
import { parseWorkout } from 'intervals-icu-workout-parser'

const workout = parseWorkout(workoutText, {
  loadPreference: ['power'],
  power: {
    ftp: 250,
    boundaries: [55, 75, 90, 105, 120, 150, 999],
  },
})

console.log(workout.durationSeconds) // Total duration
console.log(workout.metrics.estimatedTSS) // Estimated TSS
console.log(workout.metrics.intensityFactor) // IF
```

## Building Workouts

Create workouts programmatically:

```typescript
import { WorkoutBuilder, serializeWorkout } from 'intervals-icu-workout-parser'

const workout = new WorkoutBuilder()
  .title('Sweet Spot')
  .section('Warmup')
    .step().time(10).power(60).add()
  .section('Main Set').repeat(3)
    .step().time(8).powerRange(88, 94).cadence(90).add()
    .step().time(4).power(55).add()
  .section('Cooldown')
    .step().time(10).power(50).add()
  .buildWorkout()

// Serialize to Intervals.icu format
const text = serializeWorkout(workout)
console.log(text)
```

Output:

```
Sweet Spot

Warmup
- 10m 60%

Main Set 3x
- 8m 88-94% 90rpm
- 4m 55%

Cooldown
- 10m 50%
```

## Next Steps

- [Parsing API](/intervals-icu-workout-parser/api/parsing/) - Full parsing reference
- [Building API](/intervals-icu-workout-parser/api/building/) - Complete builder documentation
- [Format Specification](/intervals-icu-workout-parser/spec/overview/) - Intervals.icu format details
