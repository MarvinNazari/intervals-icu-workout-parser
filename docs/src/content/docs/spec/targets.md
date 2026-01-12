---
title: Targets
description: Power, HR, pace, and cadence targets in Intervals.icu workouts
---

Targets specify the intensity for each step. The format supports power, heart rate, pace, and cadence targets.

## Power Targets

Power is the default target type (no suffix needed).

### Percentage of FTP

```
- 10m 75%        # 75% of FTP
- 10m 88-94%     # 88-94% of FTP (range)
```

### Absolute Watts

```
- 10m 220w       # 220 watts
- 10m 200-240w   # 200-240 watts (range)
```

### Power Zones

```
- 10m Z2         # Power zone 2
- 10m Z4         # Power zone 4
```

## Heart Rate Targets

Add `HR` or `LTHR` suffix to specify heart rate targets.

### Percentage of Max HR

```
- 10m 70% HR        # 70% of max HR
- 10m 75-80% HR     # 75-80% of max HR (range)
```

### Percentage of LTHR

```
- 10m 95% LTHR      # 95% of LTHR
- 10m 85-95% LTHR   # 85-95% of LTHR (range)
```

### HR Zones

```
- 10m Z2 HR         # HR zone 2
- 10m Z2-Z3 HR      # HR zone 2-3 (range)
```

## Pace Targets

Add `pace` suffix for running/swimming pace targets.

### Percentage of Threshold

```
- 10m 90% pace          # 90% of threshold pace
- 10m 78-82% pace       # 78-82% of threshold pace (range)
```

### Pace Zones

```
- 10m Z2 pace           # Pace zone 2
- 10m Z2-Z4 pace        # Pace zone 2-4 (range)
```

### Absolute Pace

```
- 10m 5:30/km pace          # 5:30 per km
- 10m 5:30-5:00/km pace     # 5:30-5:00 per km (range)
- 10m 7:00/mi pace          # 7:00 per mile
- 10m 1:45/100m pace        # 1:45 per 100m (swimming)
```

### Pace Units

| Unit | Description |
|------|-------------|
| `/km` | Minutes per kilometer |
| `/mi` | Minutes per mile |
| `/100m` | Time per 100 meters (swimming) |
| `/100y` | Time per 100 yards (swimming) |
| `/500m` | Time per 500 meters (rowing) |
| `/400m` | Time per 400 meters (track) |

## Cadence

Add cadence after the target:

```
- 10m 75% 90rpm         # Single cadence
- 10m 80% 85-95rpm      # Cadence range
```

## Ramps

Ramps gradually change intensity:

```
- 10m ramp 50-75%       # Ramp from 50% to 75%
- 5m ramp 60-85%        # Ramp from 60% to 85%
```

## Freeride

No specific target (ERG mode off):

```
- 5m freeride           # No target
```

## Target Summary

| Target Type | Examples |
|------------|----------|
| Power % | `75%`, `88-94%` |
| Power watts | `220w`, `200-240w` |
| Power zone | `Z2`, `Z4` |
| HR % max | `70% HR`, `75-80% HR` |
| HR % LTHR | `95% LTHR`, `85-95% LTHR` |
| HR zone | `Z2 HR`, `Z2-Z3 HR` |
| Pace % | `90% pace`, `78-82% pace` |
| Pace zone | `Z2 pace`, `Z2-Z4 pace` |
| Pace absolute | `5:30/km pace` |
| Cadence | `90rpm`, `85-95rpm` |
| Ramp | `ramp 50-75%` |
| Freeride | `freeride` |
