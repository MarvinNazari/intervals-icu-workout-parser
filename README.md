# intervals-icu-workout-parser

Parse and build [Intervals.icu](https://intervals.icu) workout text format.

## Installation

```bash
npm install intervals-icu-workout-parser
```

## Quick Start

### Parsing Workouts

```typescript
import { parseWorkoutStructure, parseWorkout, calculateDuration } from 'intervals-icu-workout-parser'

// Parse workout text into AST (no zones needed)
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

console.log(structure.header?.title) // "Tempo Run"
console.log(structure.sections.length) // 3
console.log(calculateDuration(structure)) // 3300 (55 minutes in seconds)

// Parse with athlete zones to get metrics
const workout = parseWorkout(workoutText, {
  loadPreference: ['hr', 'pace'],
  hr: {
    lthr: 165,
    maxHr: 185,
    boundaries: [152, 161, 170, 179, 184, 189, 201],
  },
  pace: {
    threshold: 2.79, // m/s (~5:58 min/km)
    unit: 'mins_km',
    boundaries: [77.5, 87.7, 94.3, 100, 103.4, 111.5, 999],
  },
})

console.log(workout.durationSeconds) // Total duration
console.log(workout.metrics.estimatedTSS) // Estimated training stress
console.log(workout.metrics.intensityFactor) // Workout IF
```

### Building Workouts Programmatically

```typescript
import { WorkoutBuilder, serializeWorkout } from 'intervals-icu-workout-parser'

const workout = new WorkoutBuilder()
  .title('Sweet Spot')
  .section('Warmup')
    .step().time(10).power(60).add()
    .step().time(5).ramp(60, 85).add()
  .section('Main Set').repeat(3)
    .step().time(8).powerRange(88, 94).cadence(90).add()
    .step().time(4).power(55).add()
  .section('Cooldown')
    .step().time(10).ramp(55, 40).add()
  .buildWorkout()

// Serialize to Intervals.icu text format
const text = serializeWorkout(workout)
console.log(text)
```

Output:

```
Sweet Spot

Warmup
- 10m 60%
- 5m ramp 60-85%

Main Set 3x
- 8m 88-94% 90rpm
- 4m 55%

Cooldown
- 10m ramp 55-40%
```

## API Reference

### Parsing

#### `parseWorkoutStructure(text: string): WorkoutStructure`

Parse workout text into a structured AST. No athlete zones required.

#### `parseWorkout(text: string, zones: SportZones): StructuredWorkout`

Parse workout text with athlete zones to get duration and training metrics.

#### `calculateDuration(structure: WorkoutStructure): number`

Calculate total workout duration in seconds, accounting for section and step repeats.

### Building

#### `WorkoutBuilder`

Fluent builder for creating workouts programmatically.

```typescript
const builder = new WorkoutBuilder()
  .title('Workout Name')
  .description('Optional description')
  .category('Intervals')
  .section('Section Name')
```

#### `SectionBuilder`

Build workout sections with steps.

```typescript
section
  .repeat(4) // Set section repeat count
  .step()    // Start building a step
```

#### `StepBuilder`

Build individual workout steps with duration and targets.

**Duration methods:**
- `.time(minutes)` - Duration in minutes
- `.seconds(secs)` - Duration in seconds
- `.hours(hrs)` - Duration in hours
- `.distance(meters)` - Distance in meters
- `.km(kilometers)` - Distance in km
- `.miles(mi)` - Distance in miles

**Power targets:**
- `.power(percent)` - FTP percentage (e.g., 88 for 88%)
- `.powerRange(min, max)` - FTP percentage range
- `.watts(w)` - Absolute watts
- `.wattsRange(min, max)` - Watts range
- `.powerZone(zone)` - Power zone ('Z1' to 'Z7')

**HR targets:**
- `.hr(percent)` - Max HR percentage
- `.hrRange(min, max)` - Max HR percentage range
- `.lthr(percent)` - LTHR percentage
- `.lthrRange(min, max)` - LTHR percentage range
- `.hrZone(zone)` - HR zone ('Z1' to 'Z7')
- `.hrZoneRange(min, max)` - HR zone range

**Pace targets:**
- `.pacePercent(percent)` - Threshold pace percentage
- `.pacePercentRange(min, max)` - Threshold pace percentage range
- `.paceZone(zone)` - Pace zone ('Z1' to 'Z7')
- `.paceZoneRange(min, max)` - Pace zone range
- `.pace(value, unit)` - Absolute pace (e.g., '5:30', '/km')
- `.paceRange(min, max, unit)` - Absolute pace range

**Other:**
- `.freeride()` - No target (ERG off)
- `.cadence(rpm)` - Target cadence
- `.cadenceRange(min, max)` - Cadence range
- `.ramp(fromPercent, toPercent)` - Ramp from one intensity to another
- `.label(text)` - Step label
- `.repeat(times)` - Step repeat count
- `.add()` - Finalize and add step to section

#### `serializeWorkout(structure: WorkoutStructure): string`

Serialize a WorkoutStructure AST back to Intervals.icu text format.

## Workout Format

The parser supports the [Intervals.icu workout text format](https://forum.intervals.icu/t/workout-syntax/35803):

### Structure

```
Workout Title

Section Name
- duration target cadence

Section Name 4x
- duration target
- duration target
```

### Duration

- Time: `10m`, `30s`, `1h`, `1m30s`, `1h30m`
- Distance: `2km`, `1mi`, `400m`, `100yards`

### Targets

**Power (default):**
- Percentage: `75%`, `88-94%`
- Watts: `220w`, `200-240w`
- Zone: `Z3`

**Heart Rate:**
- Max HR: `70% HR`, `75-80% HR`
- LTHR: `95% LTHR`, `85-95% LTHR`
- Zone: `Z2 HR`, `Z2-Z3 HR`

**Pace:**
- Percentage: `90% pace`, `78-82% pace`
- Zone: `Z2 pace`, `Z2-Z3 pace`
- Absolute: `5:30/km pace`, `5:30-5:00/km pace`

**Other:**
- Freeride: `freeride`
- Cadence: `90rpm`, `85-95rpm`
- Ramp: `ramp 50-75%`

## Types

All TypeScript types are exported:

```typescript
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
  StructuredWorkout,
  SportZones,
} from 'intervals-icu-workout-parser'
```

## License

MIT
