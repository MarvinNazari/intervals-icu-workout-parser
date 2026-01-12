---
title: Introduction
description: What is intervals-icu-workout-parser and why use it
---

**intervals-icu-workout-parser** is a TypeScript/JavaScript library for parsing and building [Intervals.icu](https://intervals.icu) workout text format.

## What is Intervals.icu?

Intervals.icu is a popular training analysis platform used by cyclists, runners, triathletes, and other endurance athletes. It allows users to create structured workouts using a simple text format.

## What does this library do?

This library provides:

1. **Parsing** - Convert Intervals.icu workout text into a structured AST (Abstract Syntax Tree)
2. **Building** - Create workouts programmatically using a fluent builder API
3. **Serialization** - Convert AST back to Intervals.icu text format
4. **Metrics** - Calculate duration, estimated TSS, and intensity factor

## Use Cases

- **Training Apps** - Parse user-created workouts or display workout structure
- **Workout Generators** - Create workouts programmatically based on training plans
- **Data Analysis** - Extract and analyze workout structure from Intervals.icu exports
- **Integrations** - Bridge between Intervals.icu and other training platforms

## Example

```typescript
import { parseWorkoutStructure, calculateDuration } from 'intervals-icu-workout-parser'

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

console.log(structure.header?.title) // "Sweet Spot"
console.log(structure.sections.length) // 3
console.log(calculateDuration(structure)) // 2640 (44 minutes in seconds)
```

## LLM Documentation

Machine-readable documentation for AI assistants and code generation tools:

- [llms.txt](/intervals-icu-workout-parser/llms.txt) - Package API overview
- [llms-spec.txt](/intervals-icu-workout-parser/llms-spec.txt) - Complete workout format specification

## Next Steps

- [Installation](/intervals-icu-workout-parser/getting-started/installation/) - Add the library to your project
- [Quick Start](/intervals-icu-workout-parser/getting-started/quick-start/) - Get up and running quickly
