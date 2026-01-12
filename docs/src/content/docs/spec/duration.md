---
title: Duration
description: Time and distance duration formats in Intervals.icu workouts
---

Duration specifies how long a step lasts, either by time or distance.

## Time-Based Duration

### Minutes

```
- 10m 75%      # 10 minutes
- 5min 80%     # 5 minutes
- 30' 90%      # 30 minutes (single quote)
```

### Seconds

```
- 30s 100%     # 30 seconds
- 45" 120%     # 45 seconds (double quote)
```

### Hours

```
- 1h 65%       # 1 hour
- 1.5h 70%     # 1.5 hours
- 2hours 60%   # 2 hours
```

### Combined

```
- 1m30 80%     # 1 minute 30 seconds
- 1m30s 80%    # 1 minute 30 seconds
- 1'30" 80%    # 1 minute 30 seconds
- 1h30m 70%    # 1 hour 30 minutes
- 1h30 70%     # 1 hour 30 minutes
```

## Distance-Based Duration

### Kilometers

```
- 2km 80%      # 2 kilometers
- 5km Z2 pace  # 5 kilometers
```

### Miles

```
- 1mi 85%      # 1 mile
- 4.5mi Z2     # 4.5 miles
- 1mile 80%    # 1 mile
```

### Meters

```
- 400m 90%     # 400 meters (careful: can conflict with minutes)
- 400meters 90%  # 400 meters (explicit)
- 200mtr 95%   # 200 meters
```

:::caution
`400m` could be interpreted as 400 minutes or 400 meters. Use `400meters` or `400mtr` to be explicit about meters.
:::

### Yards

```
- 100y 85%     # 100 yards
- 100yards 85% # 100 yards
- 200yrd 90%   # 200 yards
```

## Duration Examples

| Format | Meaning |
|--------|---------|
| `10m` | 10 minutes |
| `30s` | 30 seconds |
| `1h` | 1 hour |
| `1m30` | 1 minute 30 seconds |
| `1h30m` | 1 hour 30 minutes |
| `2km` | 2 kilometers |
| `1mi` | 1 mile |
| `400meters` | 400 meters |
| `100yards` | 100 yards |

## Distance and Metrics

When calculating workout metrics (TSS, IF), distance-based steps require pace information to estimate duration. If no pace zones are provided, distance-based steps contribute 0 to the duration calculation.
