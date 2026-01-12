/**
 * Training Zones
 *
 * Sport-specific training zones and thresholds for calculating workout metrics.
 */

/**
 * Training zones for one sport.
 * Modalities are optional because not every sport has power/hr/pace data.
 */
export interface SportZones {
  /** Preference order when multiple modalities are available */
  loadPreference: ('power' | 'hr' | 'pace')[]

  power?: {
    /** Functional Threshold Power (watts) */
    ftp: number
    /** Indoor FTP (watts) if different */
    indoorFtp?: number
    /**
     * Zone boundaries as percentages of FTP.
     * E.g., [55, 75, 90, 105, 120, 150, 999] means Z1=0-55%, Z2=56-75%, etc.
     */
    boundaries?: number[]
    /** Optional labels for zones (e.g., ["Active Recovery", "Endurance", ...]) */
    names?: string[]
    /** Sweet Spot lower boundary (% of FTP, typically 84) */
    sweetSpotMin?: number
    /** Sweet Spot upper boundary (% of FTP, typically 97) */
    sweetSpotMax?: number
  }

  hr?: {
    /** Lactate Threshold Heart Rate (bpm) */
    lthr: number
    /** Max HR (bpm) */
    maxHr?: number
    /**
     * Zone boundaries as absolute HR values in bpm.
     * E.g., [152, 161, 170, 179, 184, 189, 201] means Z1=0-152, Z2=153-161, etc.
     */
    boundaries?: number[]
    /** Optional labels for zones */
    names?: string[]
  }

  pace?: {
    /**
     * Threshold pace as speed in m/s.
     * E.g., 2.793296 m/s ≈ 5:58 min/km
     */
    threshold: number
    unit: 'mins_km' | 'mins_mile' | 'secs_100m' | 'secs_100y' | 'secs_500m'
    /**
     * Zone boundaries as percentages of threshold speed.
     * Higher % = faster speed. E.g., [77.5, 87.7, 94.3, 100, 103.4, 111.5, 999]
     */
    boundaries?: number[]
    /** Optional labels for zones */
    names?: string[]
  }
}
