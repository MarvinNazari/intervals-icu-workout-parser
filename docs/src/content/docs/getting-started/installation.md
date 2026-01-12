---
title: Installation
description: How to install intervals-icu-workout-parser
---

## npm

```bash
npm install intervals-icu-workout-parser
```

## yarn

```bash
yarn add intervals-icu-workout-parser
```

## pnpm

```bash
pnpm add intervals-icu-workout-parser
```

## Requirements

- Node.js 18 or later
- TypeScript 5.0+ (if using TypeScript)

## Importing

### ESM (recommended)

```typescript
import {
  parseWorkoutStructure,
  parseWorkout,
  WorkoutBuilder
} from 'intervals-icu-workout-parser'
```

### CommonJS

```javascript
const {
  parseWorkoutStructure,
  parseWorkout,
  WorkoutBuilder
} = require('intervals-icu-workout-parser')
```

## TypeScript

The library ships with full TypeScript definitions. All types are exported:

```typescript
import type {
  WorkoutStructure,
  WorkoutSection,
  WorkoutStep,
  StepTarget,
  SportZones,
} from 'intervals-icu-workout-parser'
```
