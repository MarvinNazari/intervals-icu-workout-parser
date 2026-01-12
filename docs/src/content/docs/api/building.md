---
title: Building API
description: API reference for building workouts programmatically
---

## WorkoutBuilder

Fluent builder for creating workouts programmatically.

```typescript
import { WorkoutBuilder } from 'intervals-icu-workout-parser'

const workout = new WorkoutBuilder()
  .title('My Workout')
  .section('Warmup')
    .step().time(10).power(60).add()
  .section('Main').repeat(3)
    .step().time(5).powerRange(90, 95).add()
  .buildWorkout()
```

### Methods

| Method | Description |
|--------|-------------|
| `title(name)` | Set workout title |
| `description(...lines)` | Add description lines |
| `category(cat)` | Set workout category |
| `section(name?)` | Start a new section |
| `buildWorkout()` | Build the final `WorkoutStructure` |
| `toString()` | Build and serialize to text |

---

## SectionBuilder

Returned by `WorkoutBuilder.section()`.

### Methods

| Method | Description |
|--------|-------------|
| `repeat(times)` | Set section repeat count |
| `step()` | Start building a step |
| `section(name?)` | Start a new section |
| `buildWorkout()` | Build the full workout |

---

## StepBuilder

Returned by `SectionBuilder.step()`.

### Duration Methods

```typescript
.step().time(10)       // 10 minutes
.step().seconds(30)    // 30 seconds
.step().hours(1.5)     // 1.5 hours
.step().distance(400)  // 400 meters
.step().km(5)          // 5 kilometers
.step().miles(1)       // 1 mile
```

### Power Targets

```typescript
.step().time(10).power(88)              // 88% FTP
.step().time(10).powerRange(88, 94)     // 88-94% FTP
.step().time(10).watts(220)             // 220w
.step().time(10).wattsRange(200, 240)   // 200-240w
.step().time(10).powerZone('Z4')        // Power zone 4
```

### HR Targets

```typescript
.step().time(10).hr(75)                 // 75% max HR
.step().time(10).hrRange(70, 80)        // 70-80% max HR
.step().time(10).lthr(95)               // 95% LTHR
.step().time(10).lthrRange(85, 95)      // 85-95% LTHR
.step().time(10).hrZone('Z2')           // HR zone 2
.step().time(10).hrZoneRange('Z2', 'Z3') // HR zone 2-3
```

### Pace Targets

```typescript
.step().time(10).pacePercent(90)              // 90% threshold
.step().time(10).pacePercentRange(85, 95)     // 85-95% threshold
.step().time(10).paceZone('Z3')               // Pace zone 3
.step().time(10).paceZoneRange('Z2', 'Z4')    // Pace zone 2-4
.step().time(10).pace('5:30', '/km')          // 5:30/km
.step().time(10).paceRange('5:30', '5:00', '/km') // 5:30-5:00/km
```

### Other Step Properties

```typescript
.step().time(10).freeride()             // No target
.step().time(10).cadence(90)            // 90 rpm
.step().time(10).cadenceRange(85, 95)   // 85-95 rpm
.step().time(10).ramp(50, 75)           // Ramp 50% to 75%
.step().label('Sprint').seconds(30)     // Step label
.step().repeat(4).seconds(30)           // Repeat step 4x
```

### Finalizing Steps

Always call `.add()` to finalize a step:

```typescript
.step().time(10).power(75).cadence(90).add()
```

---

## serializeWorkout

Convert a `WorkoutStructure` AST to Intervals.icu text format.

```typescript
function serializeWorkout(structure: WorkoutStructure): string
```

### Example

```typescript
import { serializeWorkout, parseWorkoutStructure } from 'intervals-icu-workout-parser'

// Round-trip parsing
const original = `
Sweet Spot

Main Set 3x
- 8m 88-94%
- 4m 55%
`

const structure = parseWorkoutStructure(original)
const text = serializeWorkout(structure)
// text is equivalent to original
```

### Full Builder Example

```typescript
import { WorkoutBuilder } from 'intervals-icu-workout-parser'

const text = new WorkoutBuilder()
  .title('VO2 Max Intervals')
  .category('Intervals')
  .section('Warmup')
    .step().time(10).powerRange(50, 65).cadence(90).add()
    .step().time(5).ramp(65, 85).add()
  .section('Main Set').repeat(5)
    .step().time(3).powerRange(115, 120).cadence(100).add()
    .step().time(3).power(50).add()
  .section('Cooldown')
    .step().time(10).ramp(50, 40).add()
  .toString()

console.log(text)
```

Output:

```
VO2 Max Intervals

Warmup
- 10m 50-65% 90rpm
- 5m ramp 65-85%

Main Set 5x
- 3m 115-120% 100rpm
- 3m 50%

Cooldown
- 10m ramp 50-40%
```
