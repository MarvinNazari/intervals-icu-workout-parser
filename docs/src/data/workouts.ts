export type Sport = 'cycling' | 'running' | 'swimming'
export type WorkoutType = 'recovery' | 'endurance' | 'tempo' | 'threshold' | 'vo2max' | 'sprint' | 'technique'

export interface Workout {
  id: string
  name: string
  sport: Sport
  type: WorkoutType
  description: string
  tags: string[]
  workout: string
}

export const workouts: Workout[] = [
  // CYCLING
  {
    id: 'cycling-active-recovery',
    name: 'Active Recovery',
    sport: 'cycling',
    type: 'recovery',
    description: 'A very light session designed to promote blood flow to the muscles, which can help clear metabolic byproducts and accelerate recovery. This is for the day after a very hard ride or race.',
    tags: ['recovery', 'easy', 'z1'],
    workout: `Active Recovery

Warmup
- 5m 40% 85rpm

Main Set
- 20m 50% 90rpm

Cooldown
- 5m 40% 85rpm`
  },
  {
    id: 'cycling-endurance',
    name: 'Endurance Ride',
    sport: 'cycling',
    type: 'endurance',
    description: 'Classic zone 2 endurance ride to build aerobic base. Keep the effort conversational and focus on smooth pedaling.',
    tags: ['endurance', 'base', 'z2', 'aerobic'],
    workout: `Endurance Ride

Warmup
- 10m 50-55%

Main Set
- 60m 65-75%

Cooldown
- 10m 50%`
  },
  {
    id: 'cycling-sweet-spot',
    name: 'Sweet Spot Intervals',
    sport: 'cycling',
    type: 'threshold',
    description: 'Sweet spot training sits just below threshold (88-94% FTP). It provides significant training stimulus with manageable fatigue, making it efficient for building FTP.',
    tags: ['sweet-spot', 'threshold', 'ftp', 'intervals'],
    workout: `Sweet Spot

Warmup
- 10m 55%
- 5m 70%

Main Set 3x
- 10m 88-94%
- 5m 55%

Cooldown
- 10m 50%`
  },
  {
    id: 'cycling-threshold',
    name: 'Threshold Intervals',
    sport: 'cycling',
    type: 'threshold',
    description: 'Classic threshold intervals at 95-105% FTP. These intervals improve your sustainable power and lactate clearance ability.',
    tags: ['threshold', 'ftp', 'intervals', 'z4'],
    workout: `Threshold Intervals

Warmup
- 10m 55%
- 5m 75%
- 3x 1m 90%

Main Set 4x
- 8m 95-105%
- 4m 55%

Cooldown
- 10m 50%`
  },
  {
    id: 'cycling-vo2max',
    name: 'VO2max Intervals',
    sport: 'cycling',
    type: 'vo2max',
    description: 'High-intensity intervals at 106-120% FTP to push your aerobic ceiling higher. These are hard but effective for improving max power.',
    tags: ['vo2max', 'intervals', 'z5', 'high-intensity'],
    workout: `VO2max Intervals

Warmup
- 15m 55%
- 3x 1m 80%

Main Set 5x
- 3m 106-120%
- 3m 50%

Cooldown
- 10m 50%`
  },
  {
    id: 'cycling-anaerobic',
    name: 'Anaerobic Capacity',
    sport: 'cycling',
    type: 'sprint',
    description: 'These very short, very hard efforts train your body to produce and tolerate lactate. This is useful for crits, attacks, sprints, and other explosive moments in cycling.',
    tags: ['anaerobic', 'sprint', 'z6', 'power'],
    workout: `Anaerobic Capacity

Warmup
- 10m 50-65% 90rpm
- 3x 30s 100% 100rpm, 90s 50% 85rpm
- 3m 50% 85rpm

Main Set 6x
- 30s 150%+ 110rpm
- 4m 50% 85rpm

Cooldown
- 10m ramp 50-40% 80rpm`
  },
  {
    id: 'cycling-cadence-pyramid',
    name: 'Cadence Pyramid',
    sport: 'cycling',
    type: 'technique',
    description: 'A neuromuscular workout that improves your pedaling efficiency and strength across a range of cadences. This develops coordination and teaches your legs to turn smoothly at different RPMs.',
    tags: ['cadence', 'technique', 'drills', 'neuromuscular'],
    workout: `Cadence Pyramid

Warmup
- 15m 50-65% 85rpm

Main Set
- 3m 70% 70rpm
- 2m 50% 85rpm
- 3m 70% 85rpm
- 2m 50% 85rpm
- 3m 70% 100rpm
- 2m 50% 85rpm
- 3m 70% 85rpm
- 2m 50% 85rpm
- 3m 70% 70rpm

Cooldown
- 10m 50-40% 80rpm`
  },
  {
    id: 'cycling-over-unders',
    name: 'Over-Unders',
    sport: 'cycling',
    type: 'threshold',
    description: 'Alternating between just below and just above threshold teaches your body to clear lactate while still working hard. Great for race situations where pace varies.',
    tags: ['over-under', 'threshold', 'lactate', 'race-prep'],
    workout: `Over-Unders

Warmup
- 10m 55%
- 5m 75%

Main Set 3x
- 3m 90%
- 2m 105%
- 3m 90%
- 2m 105%
- 5m 55%

Cooldown
- 10m 50%`
  },

  // RUNNING
  {
    id: 'running-easy',
    name: 'Easy Run',
    sport: 'running',
    type: 'endurance',
    description: 'Conversational pace run to build aerobic base. You should be able to hold a conversation throughout. This is the foundation of any running program.',
    tags: ['easy', 'recovery', 'z2', 'base'],
    workout: `Easy Run

- 45m Z2 HR`
  },
  {
    id: 'running-recovery',
    name: 'Recovery Run',
    sport: 'running',
    type: 'recovery',
    description: 'Very easy running to promote blood flow and recovery. Keep effort minimal - this should feel almost too slow.',
    tags: ['recovery', 'easy', 'z1'],
    workout: `Recovery Run

- 30m Z1 HR`
  },
  {
    id: 'running-long-run',
    name: 'Long Run',
    sport: 'running',
    type: 'endurance',
    description: 'The cornerstone of endurance training. Build duration gradually and keep pace easy. This develops aerobic capacity and fat-burning efficiency.',
    tags: ['long-run', 'endurance', 'aerobic', 'base'],
    workout: `Long Run

- 90m Z2 HR`
  },
  {
    id: 'running-tempo',
    name: 'Tempo Run',
    sport: 'running',
    type: 'tempo',
    description: 'Sustained comfortably hard effort at lactate threshold pace. You should be able to speak in short sentences but not hold a conversation.',
    tags: ['tempo', 'threshold', 'lactate'],
    workout: `Tempo Run

Warmup
- 10m Z2 HR

Main Set
- 20m 85-90% pace

Cooldown
- 10m Z2 HR`
  },
  {
    id: 'running-cruise-intervals',
    name: 'Cruise Intervals',
    sport: 'running',
    type: 'threshold',
    description: 'Classic Daniels-style threshold work. Broken into intervals with short rest to accumulate time at threshold while managing fatigue.',
    tags: ['cruise', 'threshold', 'intervals', 'daniels'],
    workout: `Cruise Intervals

Warmup
- 15m Z2 HR

Main Set 4x
- 5m 95-100% pace
- 90s Z1 HR

Cooldown
- 10m Z2 HR`
  },
  {
    id: 'running-800m-repeats',
    name: '800m Repeats',
    sport: 'running',
    type: 'vo2max',
    description: 'Classic VO2max intervals. These hard efforts improve your aerobic capacity and running economy at high speeds.',
    tags: ['vo2max', 'intervals', '800m', 'track'],
    workout: `800m Repeats

Warmup
- 15m Z2 HR
- 4x 100m 90% pace
- 4x 100m Z1 HR

Main Set 5x
- 800m 105-110% pace
- 400m Z1 HR

Cooldown
- 10m Z1 HR`
  },
  {
    id: 'running-400m-repeats',
    name: '400m Repeats',
    sport: 'running',
    type: 'vo2max',
    description: 'Short, fast intervals to develop speed and VO2max. Focus on running form and maintaining pace throughout.',
    tags: ['vo2max', 'speed', '400m', 'track'],
    workout: `400m Repeats

Warmup
- 15m Z2 HR

Main Set 8x
- 400m 110% pace
- 400m Z1 HR

Cooldown
- 10m Z1 HR`
  },
  {
    id: 'running-hill-repeats',
    name: 'Hill Repeats',
    sport: 'running',
    type: 'vo2max',
    description: 'Build strength and VO2max with hill efforts. The incline reduces impact stress while providing high-intensity training.',
    tags: ['hills', 'strength', 'vo2max'],
    workout: `Hill Repeats

Warmup
- 10m 70-75% pace

Main Set 8x
- 45s 95-100% pace
- 2m 60-70% pace

Cooldown
- 10m 70% pace`
  },
  {
    id: 'running-fartlek',
    name: 'Fartlek',
    sport: 'running',
    type: 'tempo',
    description: 'Swedish for "speed play" - unstructured speed variations within a run. Great for developing pace awareness and breaking up monotony.',
    tags: ['fartlek', 'speed', 'tempo', 'variety'],
    workout: `Fartlek

Warmup
- 10m Z2 HR

Main Set
- 3m 90% pace
- 3m Z2 HR
- 2m 95% pace
- 2m Z2 HR
- 1m 100% pace
- 1m Z2 HR
- 2m 95% pace
- 2m Z2 HR
- 3m 90% pace
- 3m Z2 HR

Cooldown
- 10m Z1 HR`
  },
  {
    id: 'running-progressive',
    name: 'Progressive Long Run',
    sport: 'running',
    type: 'endurance',
    description: 'Start easy and gradually increase pace. Teaches pacing discipline and simulates race-day negative splitting.',
    tags: ['progressive', 'long-run', 'negative-split'],
    workout: `Progressive Long Run

- 30m 70% pace
- 30m 75% pace
- 20m 80% pace
- 10m 85% pace`
  },
  {
    id: 'running-strides',
    name: 'Easy Run with Strides',
    sport: 'running',
    type: 'technique',
    description: 'Strides are short accelerations that improve running economy and neuromuscular coordination without significant fatigue.',
    tags: ['strides', 'technique', 'easy'],
    workout: `Easy Run with Strides

Main
- 30m Z2 HR

Strides 6x
- 20s 110% pace
- 40s Z1 HR`
  },

  // SWIMMING
  {
    id: 'swimming-technique',
    name: 'Technique Session',
    sport: 'swimming',
    type: 'technique',
    description: 'Drill-heavy session focused on form work. Take your time and focus on body position, catch, and rotation.',
    tags: ['technique', 'drills', 'form'],
    workout: `Technique Session

Warmup
- 300m Z2 pace
- 200m drill

Main Set 4x
- 50m drill
- 100m Z2 pace

Cooldown
- 200m Z1 pace`
  },
  {
    id: 'swimming-endurance',
    name: 'Base Endurance',
    sport: 'swimming',
    type: 'endurance',
    description: 'Steady aerobic swimming to build your engine. Focus on maintaining good form throughout.',
    tags: ['endurance', 'base', 'aerobic'],
    workout: `Base Endurance

Warmup
- 300m easy
- 200m pull

Main Set 4x
- 200m 75% pace 20s rest
- 100m 70% pace 15s rest

Cooldown
- 200m easy`
  },
  {
    id: 'swimming-css',
    name: 'CSS Training',
    sport: 'swimming',
    type: 'threshold',
    description: 'Critical Swim Speed development. CSS is your threshold pace for swimming - the fastest pace you can sustain aerobically.',
    tags: ['css', 'threshold', 'intervals'],
    workout: `CSS Training

Warmup
- 400m Z2 pace
- 4x 50m 85% pace

Main Set 5x
- 200m 95% pace 30s rest

Cooldown
- 200m Z1 pace`
  },
  {
    id: 'swimming-threshold-100s',
    name: 'Threshold 100s',
    sport: 'swimming',
    type: 'threshold',
    description: 'Short threshold intervals with brief rest. Accumulate volume at threshold pace.',
    tags: ['threshold', '100s', 'intervals'],
    workout: `Threshold 100s

Warmup
- 300m Z2 pace
- 200m drill

Main Set 8x
- 100m 95-100% pace 20s rest

Cooldown
- 200m Z1 pace`
  },
  {
    id: 'swimming-sprint',
    name: 'Sprint Training',
    sport: 'swimming',
    type: 'sprint',
    description: 'Develop speed and power with short, fast efforts. Full recovery between sprints is essential.',
    tags: ['sprint', 'speed', 'power'],
    workout: `Sprint Training

Warmup
- 400m Z2 pace
- 4x 25m build

Main Set 8x
- 25m 110% pace 30s rest
- 75m Z2 pace

Cooldown
- 200m Z1 pace`
  },
  {
    id: 'swimming-descend',
    name: 'Descend Set',
    sport: 'swimming',
    type: 'tempo',
    description: 'Negative split each repeat, getting faster throughout. Teaches pace awareness and builds confidence.',
    tags: ['descend', 'negative-split', 'pacing'],
    workout: `Descend Set

Warmup
- 300m Z2 pace

Main Set 3x
- 100m 80% pace
- 100m 85% pace
- 100m 90% pace
- 100m 95% pace
- 100m Z1 pace

Cooldown
- 200m Z1 pace`
  },
  {
    id: 'swimming-race-sim',
    name: 'Race Simulation',
    sport: 'swimming',
    type: 'threshold',
    description: 'Triathlon swim preparation. Practice race-pace efforts and transitions.',
    tags: ['race', 'triathlon', 'simulation'],
    workout: `Race Simulation

Warmup
- 300m easy
- 4x 50m build

Main Set
- 100m 100% pace
- 400m 90% pace
- 100m 95% pace
- 200m Z2 pace

Cooldown
- 200m easy`
  },
  {
    id: 'swimming-recovery',
    name: 'Recovery Swim',
    sport: 'swimming',
    type: 'recovery',
    description: 'Active recovery session. Keep effort very low and focus on smooth, relaxed swimming.',
    tags: ['recovery', 'easy', 'technique'],
    workout: `Recovery Swim

- 200m Z1 pace
- 200m drill
- 200m Z1 pace`
  }
]

export const sportLabels: Record<Sport, string> = {
  cycling: 'Cycling',
  running: 'Running',
  swimming: 'Swimming'
}

export const sportEmoji: Record<Sport, string> = {
  cycling: '\uD83D\uDEB4',
  running: '\uD83C\uDFC3',
  swimming: '\uD83C\uDFCA'
}

export const typeLabels: Record<WorkoutType, string> = {
  recovery: 'Recovery',
  endurance: 'Endurance',
  tempo: 'Tempo',
  threshold: 'Threshold',
  vo2max: 'VO2max',
  sprint: 'Sprint',
  technique: 'Technique'
}
