import { useState, useMemo } from 'react'
import { workouts, sportLabels, sportEmoji, typeLabels, type Sport, type WorkoutType } from '../data/workouts'

interface WorkoutCardProps {
  name: string
  sport: Sport
  type: WorkoutType
  description: string
  workout: string
  tags: string[]
}

function WorkoutCard({ name, sport, type, description, workout, tags }: WorkoutCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(workout)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="workout-card">
      <div className="workout-card-header">
        <span className="workout-sport-badge">
          {sportEmoji[sport]} {sportLabels[sport].toUpperCase()}
        </span>
        <span className="workout-type-badge">{typeLabels[type]}</span>
      </div>
      <h3 className="workout-title">{name}</h3>
      <p className="workout-description">{description}</p>
      <div className="workout-content">
        <pre>{workout}</pre>
        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Copy workout"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="workout-tags">
        {tags.map(tag => (
          <span key={tag} className="workout-tag">#{tag}</span>
        ))}
      </div>
    </div>
  )
}

export default function WorkoutCatalog() {
  const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all')
  const [selectedType, setSelectedType] = useState<WorkoutType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      // Sport filter
      if (selectedSport !== 'all' && w.sport !== selectedSport) return false

      // Type filter
      if (selectedType !== 'all' && w.type !== selectedType) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = w.name.toLowerCase().includes(query)
        const matchesDescription = w.description.toLowerCase().includes(query)
        const matchesTags = w.tags.some(t => t.toLowerCase().includes(query))
        if (!matchesName && !matchesDescription && !matchesTags) return false
      }

      return true
    })
  }, [selectedSport, selectedType, searchQuery])

  const sports: (Sport | 'all')[] = ['all', 'cycling', 'running', 'swimming']
  const types: (WorkoutType | 'all')[] = ['all', 'recovery', 'endurance', 'tempo', 'threshold', 'vo2max', 'sprint', 'technique']

  return (
    <div className="workout-catalog">
      <div className="catalog-filters">
        <div className="sport-tabs">
          {sports.map(sport => (
            <button
              key={sport}
              className={`sport-tab ${selectedSport === sport ? 'active' : ''}`}
              onClick={() => setSelectedSport(sport)}
            >
              {sport === 'all' ? 'All Workouts' : `${sportEmoji[sport]} ${sportLabels[sport]}`}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search workouts or tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <select
            className="type-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as WorkoutType | 'all')}
          >
            <option value="all">All Types</option>
            {types.slice(1).map(type => (
              <option key={type} value={type}>{typeLabels[type as WorkoutType]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="workout-count">
        {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
      </div>

      <div className="workout-grid">
        {filteredWorkouts.map(w => (
          <WorkoutCard key={w.id} {...w} />
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="no-results">
          No workouts match your filters. Try adjusting your search or filters.
        </div>
      )}
    </div>
  )
}
