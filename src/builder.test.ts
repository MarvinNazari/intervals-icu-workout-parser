import { describe, it, expect } from 'vitest'
import { WorkoutBuilder, serializeWorkout } from './builder'
import { parseWorkoutStructure } from './parser'

describe('WorkoutBuilder', () => {
  describe('basic building', () => {
    it('builds a simple workout', () => {
      const workout = new WorkoutBuilder()
        .title('Test Workout')
        .section('Main')
          .step().time(10).power(75).add()
        .buildWorkout()

      expect(workout.header?.title).toBe('Test Workout')
      expect(workout.sections).toHaveLength(1)
      expect(workout.sections[0].title).toBe('Main')
      expect(workout.sections[0].steps).toHaveLength(1)
      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'time', seconds: 600 })
      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'percent', pct: 0.75 },
      })
    })

    it('builds workout with multiple sections', () => {
      const workout = new WorkoutBuilder()
        .title('Multi Section')
        .section('Warmup')
          .step().time(10).power(60).add()
        .section('Main Set').repeat(3)
          .step().time(5).power(90).add()
          .step().time(2).power(50).add()
        .section('Cooldown')
          .step().time(5).power(50).add()
        .buildWorkout()

      expect(workout.sections).toHaveLength(3)
      expect(workout.sections[0].title).toBe('Warmup')
      expect(workout.sections[1].title).toBe('Main Set')
      expect(workout.sections[1].repeat?.times).toBe(3)
      expect(workout.sections[2].title).toBe('Cooldown')
    })

    it('builds workout with header info', () => {
      const workout = new WorkoutBuilder()
        .title('Sweet Spot')
        .description('A classic sweet spot workout', 'Great for building base fitness')
        .category('Intervals')
        .section('Main')
          .step().time(20).powerRange(88, 94).add()
        .buildWorkout()

      expect(workout.header?.title).toBe('Sweet Spot')
      expect(workout.header?.descriptionLines).toEqual([
        'A classic sweet spot workout',
        'Great for building base fitness',
      ])
      expect(workout.header?.category).toBe('Intervals')
    })
  })

  describe('duration methods', () => {
    it('sets duration in minutes', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(30).power(75).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'time', seconds: 1800 })
    })

    it('sets duration in seconds', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().seconds(45).power(100).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'time', seconds: 45 })
    })

    it('sets duration in hours', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().hours(1.5).power(65).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'time', seconds: 5400 })
    })

    it('sets distance in meters', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().distance(400).paceZone('Z3').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'distance', meters: 400 })
    })

    it('sets distance in kilometers', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().km(5).pacePercent(85).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'distance', meters: 5000 })
    })

    it('sets distance in miles', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().miles(1).pacePercent(90).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].duration).toEqual({ kind: 'distance', meters: 1609 })
    })
  })

  describe('power targets', () => {
    it('sets power percentage', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).power(88).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'percent', pct: 0.88 },
      })
    })

    it('sets power range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).powerRange(88, 94).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'percent_range', minPct: 0.88, maxPct: 0.94 },
      })
    })

    it('sets absolute watts', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).watts(220).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'watts', watts: 220 },
      })
    })

    it('sets watts range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).wattsRange(200, 240).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'watts_range', minWatts: 200, maxWatts: 240 },
      })
    })

    it('sets power zone', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).powerZone('Z4').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'power',
        value: { type: 'zone', zone: 'Z4' },
      })
    })
  })

  describe('HR targets', () => {
    it('sets HR percentage', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).hr(75).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'max_hr',
        value: { type: 'percent', pct: 0.75 },
      })
    })

    it('sets HR range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).hrRange(70, 80).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'max_hr',
        value: { type: 'percent_range', minPct: 0.70, maxPct: 0.80 },
      })
    })

    it('sets LTHR percentage', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).lthr(95).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'lthr',
        value: { type: 'percent', pct: 0.95 },
      })
    })

    it('sets LTHR range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).lthrRange(85, 95).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'lthr',
        value: { type: 'percent_range', minPct: 0.85, maxPct: 0.95 },
      })
    })

    it('sets HR zone', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).hrZone('Z2').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'zone',
        value: { type: 'zone', zone: 'Z2' },
      })
    })

    it('sets HR zone range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).hrZoneRange('Z2', 'Z3').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'hr',
        basis: 'zone',
        value: { type: 'zone_range', minZone: 'Z2', maxZone: 'Z3' },
      })
    })
  })

  describe('pace targets', () => {
    it('sets pace percentage', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).pacePercent(85).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'percent', pct: 0.85 },
      })
    })

    it('sets pace percentage range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).pacePercentRange(80, 90).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'percent_range', minPct: 0.80, maxPct: 0.90 },
      })
    })

    it('sets pace zone', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).paceZone('Z3').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'zone', zone: 'Z3' },
      })
    })

    it('sets pace zone range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).paceZoneRange('Z2', 'Z4').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'zone_range', minZone: 'Z2', maxZone: 'Z4' },
      })
    })

    it('sets absolute pace', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).pace('5:30', '/km').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'absolute', pace: '5:30', unit: '/km' },
      })
    })

    it('sets absolute pace range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).paceRange('5:30', '5:00', '/km').add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({
        kind: 'pace',
        value: { type: 'absolute_range', minPace: '5:30', maxPace: '5:00', unit: '/km' },
      })
    })

    it('sets freeride', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(5).freeride().add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].target).toEqual({ kind: 'freeride' })
    })
  })

  describe('other step properties', () => {
    it('sets cadence', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).power(85).cadence(90).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].cadence).toEqual({ rpm: 90 })
    })

    it('sets cadence range', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).power(85).cadenceRange(85, 95).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].cadence).toEqual({ rangeRpm: { min: 85, max: 95 } })
    })

    it('sets ramp', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().time(10).ramp(50, 75).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].ramp).toEqual({ fromPct: 0.50, toPct: 0.75 })
    })

    it('sets label', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().label('Big gear').time(5).power(90).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].label).toBe('Big gear')
    })

    it('sets step repeat', () => {
      const workout = new WorkoutBuilder()
        .section()
          .step().repeat(4).seconds(30).power(100).add()
        .buildWorkout()

      expect(workout.sections[0].steps[0].repeat).toEqual({ times: 4 })
    })
  })

  describe('toString', () => {
    it('serializes workout to text format', () => {
      const text = new WorkoutBuilder()
        .title('Tempo Run')
        .section('Warmup')
          .step().time(10).hrZone('Z2').add()
        .section('Main Set').repeat(3)
          .step().time(10).pacePercent(90).add()
          .step().time(5).hrZone('Z2').add()
        .section('Cool Down')
          .step().time(10).hrZone('Z1').add()
        .toString()

      expect(text).toContain('Tempo Run')
      expect(text).toContain('Warmup')
      expect(text).toContain('Main Set 3x')
      expect(text).toContain('Cool Down')
    })
  })
})

describe('serializeWorkout', () => {
  it('serializes a simple workout', () => {
    const structure = parseWorkoutStructure(`
Simple Workout

Main
- 10m 75%
- 5m 90%
`)
    const text = serializeWorkout(structure)

    expect(text).toContain('Simple Workout')
    expect(text).toContain('Main')
    expect(text).toContain('- 10m 75%')
    expect(text).toContain('- 5m 90%')
  })

  it('serializes section repeats', () => {
    const structure = parseWorkoutStructure(`
Intervals

Main Set 4x
- 3m 90%
- 2m 50%
`)
    const text = serializeWorkout(structure)

    expect(text).toContain('Main Set 4x')
  })

  it('serializes HR targets', () => {
    const structure = parseWorkoutStructure('- 10m 70% HR')
    const text = serializeWorkout(structure)

    expect(text).toContain('70% HR')
  })

  it('serializes LTHR targets', () => {
    const structure = parseWorkoutStructure('- 10m 95% LTHR')
    const text = serializeWorkout(structure)

    expect(text).toContain('95% LTHR')
  })

  it('serializes pace targets', () => {
    const structure = parseWorkoutStructure('- 10m 90% pace')
    const text = serializeWorkout(structure)

    expect(text).toContain('90% pace')
  })

  it('serializes cadence', () => {
    const structure = parseWorkoutStructure('- 10m 75% 90rpm')
    const text = serializeWorkout(structure)

    expect(text).toContain('90rpm')
  })

  it('serializes cadence range', () => {
    const structure = parseWorkoutStructure('- 10m 75% 85-95rpm')
    const text = serializeWorkout(structure)

    expect(text).toContain('85-95rpm')
  })

  it('serializes ramp', () => {
    const structure = parseWorkoutStructure('- 10m ramp 50-75%')
    const text = serializeWorkout(structure)

    expect(text).toContain('ramp 50-75%')
  })

  it('serializes freeride', () => {
    const structure = parseWorkoutStructure('- 5m freeride')
    const text = serializeWorkout(structure)

    expect(text).toContain('freeride')
  })

  describe('round-trip parsing', () => {
    it('preserves workout structure through round-trip', () => {
      const original = `
VO2 Max Intervals

Warmup
- 10m 60%

Main Set 5x
- 3m 115%
- 3m 50%

Cooldown
- 10m 50%
`
      const structure = parseWorkoutStructure(original)
      const serialized = serializeWorkout(structure)
      const reparsed = parseWorkoutStructure(serialized)

      expect(reparsed.header?.title).toBe(structure.header?.title)
      expect(reparsed.sections).toHaveLength(structure.sections.length)
      expect(reparsed.sections[1].repeat?.times).toBe(structure.sections[1].repeat?.times)
    })
  })
})
