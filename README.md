# intervals-icu-workout-parser

[![npm version](https://img.shields.io/npm/v/intervals-icu-workout-parser.svg)](https://www.npmjs.com/package/intervals-icu-workout-parser)
[![CI](https://github.com/MarvinNazari/intervals-icu-workout-parser/actions/workflows/ci.yml/badge.svg)](https://github.com/MarvinNazari/intervals-icu-workout-parser/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Parse and build [Intervals.icu](https://intervals.icu) workout text format.

**[Documentation](https://marvinnazari.github.io/intervals-icu-workout-parser/)** | **[Workout Library](https://marvinnazari.github.io/intervals-icu-workout-parser/catalog/)** | **[Format Spec](https://marvinnazari.github.io/intervals-icu-workout-parser/spec/overview/)**

## Installation

```bash
npm install intervals-icu-workout-parser
```

## Quick Example

```typescript
import { parseWorkoutStructure, WorkoutBuilder, serializeWorkout } from 'intervals-icu-workout-parser'

// Parse workout text → AST
const structure = parseWorkoutStructure(`
Sweet Spot

Warmup
- 10m 60%

Main Set 3x
- 8m 88-94%
- 4m 55%

Cooldown
- 10m 50%
`)

// Build workout programmatically
const workout = new WorkoutBuilder()
  .title('Sweet Spot')
  .section('Warmup')
    .step().time(10).power(60).add()
  .section('Main Set').repeat(3)
    .step().time(8).powerRange(88, 94).add()
    .step().time(4).power(55).add()
  .section('Cooldown')
    .step().time(10).power(50).add()
  .buildWorkout()

// Serialize AST → text
const text = serializeWorkout(workout)
```

## Features

- **Parse** - Convert Intervals.icu text to structured AST
- **Build** - Create workouts with fluent builder API
- **Serialize** - Convert AST back to text format
- **Metrics** - Calculate duration, TSS, intensity factor
- **TypeScript** - Full type definitions included

## Documentation

- [Getting Started](https://marvinnazari.github.io/intervals-icu-workout-parser/getting-started/introduction/)
- [API Reference](https://marvinnazari.github.io/intervals-icu-workout-parser/api/parsing/)
- [Format Specification](https://marvinnazari.github.io/intervals-icu-workout-parser/spec/overview/)
- [Workout Library](https://marvinnazari.github.io/intervals-icu-workout-parser/catalog/)

## LLM Integration

Machine-readable documentation for AI assistants:

- [llms.txt](https://marvinnazari.github.io/intervals-icu-workout-parser/llms.txt) - Package API
- [llms-spec.txt](https://marvinnazari.github.io/intervals-icu-workout-parser/llms-spec.txt) - Format specification

## License

MIT
