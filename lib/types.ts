export type ActivityType = 'weights' | 'swim' | 'kettlebell' | 'yoga' | 'custom'
export type WeightUnit = 'kg' | 'lbs'
export type SessionStatus = 'active' | 'completed'
export type StrokeType = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'mixed'
export type YogaStyle = 'vinyasa' | 'yin' | 'hatha' | 'power' | 'other'
export type KettlebellMode = 'set-based' | 'circuit'
export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'full-body' | 'other'

export interface Exercise {
  id: string
  name: string
  activity_type: ActivityType
  muscle_group?: MuscleGroup
  created_at: string
}

export interface Session {
  id: string
  date: string
  activity_type: ActivityType
  start_time: string
  end_time?: string
  duration_minutes?: number
  notes?: string
  status: SessionStatus
  synced: boolean
}

export interface WeightEntry {
  id: string
  session_id: string
  exercise_id: string
  set_number: number
  weight_kg: number
  reps: number
  order_index: number
}

export interface SwimEntry {
  id: string
  session_id: string
  duration_minutes: number
  distance_meters?: number
  laps?: number
  stroke_type: StrokeType
  notes?: string
}

export interface KettlebellEntry {
  id: string
  session_id: string
  mode: KettlebellMode
  exercise_id?: string
  set_number?: number
  weight_kg?: number
  reps?: number
  duration_minutes?: number
  notes?: string
}

export interface YogaEntry {
  id: string
  session_id: string
  style: YogaStyle
  duration_minutes: number
  intensity: number
  notes?: string
}

export const ACTIVITY_COLORS: Record<ActivityType, string> = {
  weights: '#3B82F6',
  swim: '#14B8A6',
  kettlebell: '#F97316',
  yoga: '#A855F7',
  custom: '#6B7280',
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  weights: 'Weights',
  swim: 'Swim',
  kettlebell: 'Kettlebell',
  yoga: 'Yoga',
  custom: 'Custom',
}

