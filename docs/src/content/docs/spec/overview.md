---
title: Format Overview
description: Overview of the Intervals.icu workout text format
---

The Intervals.icu workout format is a human-readable text format for describing structured workouts. This page provides a complete reference for the format.

## Basic Structure

A workout consists of:

1. **Header** (optional) - Title, description, category
2. **Sections** - Named groups of steps (Warmup, Main Set, etc.)
3. **Steps** - Individual intervals with duration and targets

```
Workout Title

Section Name
- duration target

Section Name 4x
- duration target
- duration target
```

## Header

The header appears at the top of the workout:

```
Sweet Spot Intervals

Great for building aerobic base
Focus on smooth pedaling

Category: Intervals

Warmup
- 10m 60%
```

- **Title** - First line, followed by an empty line
- **Description** - Additional lines before sections
- **Category** - Line starting with `Category:`

## Steps

Steps start with a dash (`-`) and contain:

```
- duration target cadence
```

Examples:

```
- 10m 75%           # 10 minutes at 75% FTP
- 30s 120% 100rpm   # 30 seconds at 120% with cadence
- 5km Z2 HR         # 5km in HR zone 2
```

## Comments

Lines not starting with `-` and not recognized as section headers are typically ignored or treated as descriptions.

## Complete Example

```
VO2 Max Intervals

High intensity workout
Build your aerobic capacity

Category: Intervals

Warmup
- 10m 50-65% 90rpm
- 5m ramp 65-85%
- 2m 55% 85rpm

Main Set 5x
- 3m 115-120% 100rpm
- 3m 50% 85rpm

Cooldown
- 10m ramp 50-40% 80rpm
```

## Next Steps

- [Duration](/intervals-icu-workout-parser/spec/duration/) - Time and distance formats
- [Targets](/intervals-icu-workout-parser/spec/targets/) - Power, HR, and pace targets
- [Sections](/intervals-icu-workout-parser/spec/sections/) - Section headers and repeats
