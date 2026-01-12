import { describe, it, expect } from 'vitest'
import { parseWorkout, parseWorkoutStructure, calculateDuration } from './parser'
import type { SportZones } from './types/zones'

// Test fixtures
const mockSportZones: SportZones = {
  loadPreference: ['power', 'hr', 'pace'],
  power: {
    ftp: 250,
    boundaries: [55, 75, 90, 105, 120, 150, 999],
  },
  hr: {
    lthr: 165,
    maxHr: 185,
    boundaries: [152, 161, 170, 179, 184, 189, 201],
  },
  pace: {
    threshold: 2.79, // ~5:58/km
    unit: 'mins_km',
    boundaries: [77.5, 87.7, 94.3, 100, 103.4, 111.5, 999],
  },
}

describe('parseWorkoutStructure', () => {
  describe('header parsing', () => {
    it('parses title from first line', () => {
      const result = parseWorkoutStructure(`
Sweet Spot

Main Set
- 10m 88%
`)
      expect(result.header?.title).toBe('Sweet Spot')
    })

    it('parses category line', () => {
      const result = parseWorkoutStructure(`
Sweet Spot

Category: Intervals

Main Set
- 10m 88%
`)
      expect(result.header?.category).toBe('Intervals')
    })
  })

  describe('section parsing', () => {
    it('parses section with title', () => {
      const result = parseWorkoutStructure(`
Warmup
- 10m 60%
`)
      expect(result.sections[0].title).toBe('Warmup')
    })

    it('parses section with repeat count', () => {
      const result = parseWorkoutStructure(`
Main Set 4x
- 3m 90%
- 2m 50%
`)
      expect(result.sections[0].title).toBe('Main Set')
      expect(result.sections[0].repeat?.times).toBe(4)
    })

    it('parses standalone repeat', () => {
      const result = parseWorkoutStructure(`
6x
- 30s 120%
- 90s 50%
`)
      expect(result.sections[0].repeat?.times).toBe(6)
      expect(result.sections[0].repeat?.isStandalone).toBe(true)
    })
  })

  describe('duration parsing', () => {
    it('parses minutes', () => {
      const result = parseWorkoutStructure('- 10m 75%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'time',
        seconds: 600,
        raw: '10m',
      })
    })

    it('parses seconds', () => {
      const result = parseWorkoutStructure('- 30s 100%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'time',
        seconds: 30,
        raw: '30s',
      })
    })

    it('parses combined minutes and seconds', () => {
      const result = parseWorkoutStructure('- 1m30 75%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'time',
        seconds: 90,
        raw: '1m30',
      })
    })

    it('parses hours', () => {
      const result = parseWorkoutStructure('- 1h 65%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'time',
        seconds: 3600,
        raw: '1h',
      })
    })

    it('parses kilometers', () => {
      const result = parseWorkoutStructure('- 2km 80%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'distance',
        meters: 2000,
        raw: '2km',
      })
    })

    it('parses miles', () => {
      const result = parseWorkoutStructure('- 1mi 80%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'distance',
        meters: 1609,
        raw: '1mi',
      })
    })

    it('parses meters', () => {
      const result = parseWorkoutStructure('- 200meters 90%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'distance',
        meters: 200,
        raw: '200meters',
      })
    })

    it('parses yards', () => {
      const result = parseWorkoutStructure('- 100yards 85%')
      expect(result.sections[0].steps[0].duration).toEqual({
        kind: 'distance',
        meters: 91,
        raw: '100yards',
      })
    })
  })

  describe('power target parsing', () => {
    it('parses percentage', () => {
      const result = parseWorkoutStructure('- 10m 75%')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'percent', pct: 0.75 },
      })
    })

    it('parses percentage range', () => {
      const result = parseWorkoutStructure('- 10m 88-94%')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'percent_range', minPct: 0.88, maxPct: 0.94 },
      })
    })

    it('parses absolute watts', () => {
      const result = parseWorkoutStructure('- 10m 220w')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'watts', watts: 220 },
      })
    })

    it('parses watts range', () => {
      const result = parseWorkoutStructure('- 10m 200-240w')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'watts_range', minWatts: 200, maxWatts: 240 },
      })
    })

    it('parses zone', () => {
      const result = parseWorkoutStructure('- 10m Z3')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'zone', zone: 'Z3' },
      })
    })
  })

  describe('HR target parsing', () => {
    it('parses percentage with HR suffix', () => {
      const result = parseWorkoutStructure('- 10m 70% HR')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'max_hr',
        value: { type: 'percent', pct: 0.70 },
      })
    })

    it('parses percentage range with HR suffix', () => {
      const result = parseWorkoutStructure('- 10m 75-80% HR')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'max_hr',
        value: { type: 'percent_range', minPct: 0.75, maxPct: 0.80 },
      })
    })

    it('parses LTHR percentage', () => {
      const result = parseWorkoutStructure('- 10m 95% LTHR')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'lthr',
        value: { type: 'percent', pct: 0.95 },
      })
    })

    it('parses zone with HR suffix', () => {
      const result = parseWorkoutStructure('- 10m Z2 HR')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'zone',
        value: { type: 'zone', zone: 'Z2' },
      })
    })

    it('parses zone range with HR suffix', () => {
      const result = parseWorkoutStructure('- 40m Z2-Z3 HR')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'zone',
        value: { type: 'zone_range', minZone: 'Z2', maxZone: 'Z3' },
      })
    })

    it('parses same zone range as single zone', () => {
      const result = parseWorkoutStructure('- 40m Z2-Z2 HR')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'zone',
        value: { type: 'zone', zone: 'Z2' },
      })
    })

    it('parses multi-step workout with HR and LTHR targets', () => {
      const result = parseWorkoutStructure(`- 45m Z2 HR

- 30m 50-60% LTHR`)
      expect(result.sections).toHaveLength(1)
      expect(result.sections[0].steps).toHaveLength(2)
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'zone',
        value: { type: 'zone', zone: 'Z2' },
      })
      expect(result.sections[0].steps[1].target).toEqual({
        kind: 'hr',
        basis: 'lthr',
        value: { type: 'percent_range', minPct: 0.50, maxPct: 0.60 },
      })
    })
  })

  describe('pace target parsing', () => {
    it('parses percentage with pace suffix', () => {
      const result = parseWorkoutStructure('- 10m 90% pace')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'percent', pct: 0.90 },
      })
    })

    it('parses percentage range with pace suffix', () => {
      const result = parseWorkoutStructure('- 10m 78-82% pace')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'percent_range', minPct: 0.78, maxPct: 0.82 },
      })
    })

    it('parses zone with pace suffix', () => {
      const result = parseWorkoutStructure('- 10m Z2 Pace')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'zone', zone: 'Z2' },
      })
    })

    it('parses absolute pace', () => {
      const result = parseWorkoutStructure('- 10m 7:15/km Pace')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'absolute', pace: '7:15', unit: '/km' },
      })
    })

    it('parses absolute pace range', () => {
      const result = parseWorkoutStructure('- 10m 7:15-7:00/km Pace')
      expect(result.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'absolute_range', minPace: '7:15', maxPace: '7:00', unit: '/km' },
      })
    })
  })

  describe('cadence parsing', () => {
    it('parses single RPM', () => {
      const result = parseWorkoutStructure('- 10m 75% 90rpm')
      expect(result.sections[0].steps[0].cadence).toEqual({ rpm: 90 })
    })

    it('parses RPM range', () => {
      const result = parseWorkoutStructure('- 10m 80% 90-100rpm')
      expect(result.sections[0].steps[0].cadence).toEqual({
        rangeRpm: { min: 90, max: 100 },
      })
    })
  })

  describe('ramp parsing', () => {
    it('parses ramp percentage', () => {
      const result = parseWorkoutStructure('- 10m ramp 50-75%')
      expect(result.sections[0].steps[0].ramp).toEqual({
        fromPct: 0.50,
        toPct: 0.75,
      })
    })
  })

  describe('freeride parsing', () => {
    it('parses freeride target', () => {
      const result = parseWorkoutStructure('- 5m freeride')
      expect(result.sections[0].steps[0].target).toEqual({ kind: 'freeride' })
    })
  })

  describe('step label parsing', () => {
    it('parses label before duration', () => {
      const result = parseWorkoutStructure('- Big gear work 4m 90%')
      expect(result.sections[0].steps[0].label).toBe('Big gear work')
    })
  })

  describe('step repeat parsing', () => {
    it('parses inline step repeat', () => {
      const result = parseWorkoutStructure('- 4x 30s 100%')
      expect(result.sections[0].steps[0].repeat?.times).toBe(4)
    })
  })
})

describe('calculateDuration', () => {
  it('calculates simple workout duration', () => {
    const structure = parseWorkoutStructure(`
- 10m 75%
- 5m 90%
`)
    expect(calculateDuration(structure)).toBe(900) // 15 minutes
  })

  it('applies section repeats', () => {
    const structure = parseWorkoutStructure(`
Main Set 4x
- 3m 90%
- 2m 50%
`)
    expect(calculateDuration(structure)).toBe(1200) // (3 + 2) * 4 = 20 minutes
  })

  it('applies step repeats', () => {
    const structure = parseWorkoutStructure(`
- 4x 30s 100%
`)
    expect(calculateDuration(structure)).toBe(120) // 30s * 4 = 2 minutes
  })

  it('handles multiple sections', () => {
    const structure = parseWorkoutStructure(`
Warmup
- 10m 60%

Main Set 3x
- 4m 90%
- 2m 50%

Cooldown
- 5m 50%
`)
    // 10 + (4 + 2) * 3 + 5 = 33 minutes
    expect(calculateDuration(structure)).toBe(1980)
  })
})

describe('parseWorkout', () => {
  it('returns full structured workout with metrics', () => {
    const result = parseWorkout(
      `
Sweet Spot

Warmup
- 10m 60%

Main Set 3x
- 8m 90%
- 4m 55%

Cooldown
- 5m 50%
`,
      mockSportZones
    )

    expect(result.structure.header?.title).toBe('Sweet Spot')
    expect(result.durationSeconds).toBe(3060) // 10 + (8 + 4) * 3 + 5 = 51 minutes
    expect(result.metrics.avgIntensity).toBeGreaterThan(0)
    expect(result.metrics.normalizedIntensity).toBeGreaterThan(0)
    expect(result.metrics.intensityFactor).toBeGreaterThan(0)
    expect(result.metrics.estimatedTSS).toBeGreaterThan(0)
  })

  it('calculates reasonable TSS for tempo workout', () => {
    const result = parseWorkout(
      `
Classic Tempo

Warmup
- 10m 70-75% pace

Main Set
- 20m 88-93% pace

Cooldown
- 10m 75-70% pace
`,
      mockSportZones
    )

    // 40 minute tempo run at ~80% avg intensity
    // IF ≈ 0.80, TSS ≈ (40/60) * 0.80^2 * 100 ≈ 43
    expect(result.durationSeconds).toBe(2400)
    expect(result.metrics.avgIntensity).toBeGreaterThan(0.7)
    expect(result.metrics.avgIntensity).toBeLessThan(0.9)
    expect(result.metrics.estimatedTSS).toBeGreaterThan(30)
    expect(result.metrics.estimatedTSS).toBeLessThan(60)
  })

  it('handles freeride steps (no intensity)', () => {
    const result = parseWorkout(
      `
- 10m 75%
- 5m freeride
- 10m 75%
`,
      mockSportZones
    )

    // Freeride contributes to duration but not intensity calculation
    expect(result.durationSeconds).toBe(1500) // 25 minutes
    expect(result.metrics.avgIntensity).toBeDefined()
  })

  it('returns empty metrics when no zones provided', () => {
    const emptyZones: SportZones = { loadPreference: [] }
    const result = parseWorkout('- 10m 75%', emptyZones)

    expect(result.metrics.avgIntensity).toBeUndefined()
    expect(result.metrics.estimatedTSS).toBeUndefined()
  })

  it('handles ramps by averaging start and end', () => {
    const result = parseWorkout(
      `
- 10m ramp 50-100%
`,
      mockSportZones
    )

    // Ramp from 50% to 100%, avg should be ~75%
    expect(result.metrics.avgIntensity).toBeCloseTo(0.75, 1)
  })
})

describe('real workout examples', () => {
  it('parses VO2 Max cycling workout', () => {
    const result = parseWorkout(
      `
VO2 Max

Warmup
- 10m 50-65% 90rpm
- 5m ramp 65-85% 95rpm
- 2m 55% 85rpm

Main Set 5x
- 3m 115-120% 100rpm
- 3m 50% 85rpm

Cooldown
- 10m ramp 50-40% 80rpm
`,
      mockSportZones
    )

    expect(result.structure.header?.title).toBe('VO2 Max')
    expect(result.structure.sections).toHaveLength(3)
    expect(result.structure.sections[1].repeat?.times).toBe(5)

    // Duration: 10 + 5 + 2 + (3 + 3) * 5 + 10 = 57 minutes
    expect(result.durationSeconds).toBe(3420)

    // High intensity workout, IF > 0.8
    expect(result.metrics.normalizedIntensity).toBeGreaterThan(0.7)
  })

  it('parses Hill Repeats running workout', () => {
    const result = parseWorkout(
      `
Hill Repeats

Warmup
- 10m 70-75% pace

Main Set 8x
- 45s 95-100% pace
- 2m 60-70% pace

Cooldown
- 10m 70% pace
`,
      mockSportZones
    )

    expect(result.structure.header?.title).toBe('Hill Repeats')

    // Duration: 10 + (0.75 + 2) * 8 + 10 = 42 minutes
    expect(result.durationSeconds).toBe(2520)
  })

  it('parses swimming workout with rest', () => {
    const result = parseWorkoutStructure(`
Base Endurance

Warmup
- 300m easy swim
- 200m drill mix

Main Set 4x
- 200m 75% pace 20s rest
- 100m 70% pace 15s rest

Cooldown
- 200m easy swim
`)

    expect(result.header?.title).toBe('Base Endurance')
    expect(result.sections).toHaveLength(3)
    expect(result.sections[1].steps[0].restAfter?.seconds).toBe(20)
  })
})
