---
title: Sections & Repeats
description: Workout sections and repeat syntax in Intervals.icu workouts
---

Sections group related steps together and support repeat functionality.

## Section Headers

A section header is a line that doesn't start with `-`:

```
Warmup
- 10m 60%

Main Set
- 5m 90%
- 3m 50%

Cooldown
- 10m 50%
```

## Section Repeats

Add `Nx` after the section name to repeat:

```
Main Set 4x
- 3m 90%
- 2m 50%
```

This means:
- Do 3 minutes at 90%
- Do 2 minutes at 50%
- Repeat 4 times (total: 20 minutes)

## Standalone Repeats

A repeat without a section name:

```
6x
- 30s 120%
- 90s 50%
```

## Step Repeats

Individual steps can also repeat:

```
- 4x 30s 100%    # Do 30s at 100%, 4 times
```

## Combining Repeats

Section and step repeats can be combined:

```
Main Set 3x
- 4x 30s 110%
- 2m 50%
```

This creates:
- 4 × 30s at 110%
- 2m at 50%
- Repeat the whole set 3 times

Total: 3 × (4 × 30s + 2m) = 3 × 4m = 12m

## Multiple Sections

```
Tempo Run

Warmup
- 10m 70% pace

Main Set 3x
- 8m 88% pace
- 4m 70% pace

Cooldown
- 10m 65% pace
```

## Duration Calculation

The parser calculates total duration accounting for all repeats:

```typescript
import { parseWorkoutStructure, calculateDuration } from 'intervals-icu-workout-parser'

const structure = parseWorkoutStructure(`
Warmup
- 10m 60%

Main Set 4x
- 3m 90%
- 2m 50%

Cooldown
- 5m 50%
`)

const duration = calculateDuration(structure)
// 10 + (3 + 2) × 4 + 5 = 35 minutes = 2100 seconds
console.log(duration) // 2100
```

## Common Patterns

### Classic Intervals

```
Main Set 5x
- 3m 105-110%
- 3m 50%
```

### Pyramid

```
Pyramid
- 1m 100%
- 1m 50%
- 2m 100%
- 2m 50%
- 3m 100%
- 3m 50%
- 2m 100%
- 2m 50%
- 1m 100%
- 1m 50%
```

### Tabata-Style

```
Tabata 8x
- 20s 170%
- 10s 40%
```

### Progressive Build

```
Build
- 5m 70%
- 5m 80%
- 5m 90%
- 5m 100%
```
