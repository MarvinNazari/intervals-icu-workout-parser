---
title: Workout Catalog
description: Example workouts ready to use in Intervals.icu
---

This catalog contains example workouts in Intervals.icu format. Copy and paste them directly into Intervals.icu or use them as templates.

## Sports

- [Cycling](/intervals-icu-workout-parser/catalog/cycling/) - Power-based cycling workouts
- [Running](/intervals-icu-workout-parser/catalog/running/) - Pace and HR-based running workouts
- [Swimming](/intervals-icu-workout-parser/catalog/swimming/) - Pool swimming workouts

## Workout Types

| Type | Description |
|------|-------------|
| **Endurance** | Long, steady efforts in Z2 |
| **Tempo** | Sustained efforts at 76-90% FTP |
| **Sweet Spot** | 88-94% FTP, high training benefit |
| **Threshold** | At or near FTP (95-105%) |
| **VO2 Max** | High intensity intervals (106-120%) |
| **Anaerobic** | Short, very high intensity (>120%) |
| **Recovery** | Easy spinning, active recovery |

## Using These Workouts

### In Intervals.icu

1. Go to Calendar → Add Workout
2. Click "Workout" tab
3. Paste the workout text
4. Adjust targets if needed
5. Save

### Programmatically

```typescript
import { parseWorkoutStructure } from 'intervals-icu-workout-parser'

const workout = `
Sweet Spot

Warmup
- 10m 60%

Main Set 3x
- 8m 88-94%
- 4m 55%

Cooldown
- 10m 50%
`

const structure = parseWorkoutStructure(workout)
// Use structure in your app
```

## Customizing Workouts

Adjust these common parameters:

- **Duration** - Change step lengths
- **Intensity** - Adjust percentage targets
- **Repeats** - Modify `Nx` values
- **Cadence** - Add `XXrpm` to steps

Example customization:

```diff
Main Set 3x
-- 8m 88-94%
+- 10m 85-90% 90rpm
- 4m 55%
```
