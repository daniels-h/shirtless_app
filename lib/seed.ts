import { db } from './db'
import type { Exercise, Session, WeightEntry, SwimEntry, YogaEntry } from './types'

const uid = () => crypto.randomUUID()

const exercises: Exercise[] = [
  // Chest
  { id: uid(), name: 'Bench Press', activity_type: 'weights', muscle_group: 'chest', created_at: new Date().toISOString() },
  { id: uid(), name: 'Incline Bench Press', activity_type: 'weights', muscle_group: 'chest', created_at: new Date().toISOString() },
  { id: uid(), name: 'Decline Bench Press', activity_type: 'weights', muscle_group: 'chest', created_at: new Date().toISOString() },
  { id: uid(), name: 'Dumbbell Fly', activity_type: 'weights', muscle_group: 'chest', created_at: new Date().toISOString() },
  { id: uid(), name: 'Cable Crossover', activity_type: 'weights', muscle_group: 'chest', created_at: new Date().toISOString() },
  { id: uid(), name: 'Push-up', activity_type: 'weights', muscle_group: 'chest', created_at: new Date().toISOString() },
  // Back
  { id: uid(), name: 'Deadlift', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Pull-up', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Barbell Row', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Seated Cable Row', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Lat Pulldown', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Single-Arm Row', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Face Pull', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'T-Bar Row', activity_type: 'weights', muscle_group: 'back', created_at: new Date().toISOString() },
  // Legs
  { id: uid(), name: 'Squat', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Leg Press', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Romanian Deadlift', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Lunges', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Leg Curl', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Leg Extension', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Calf Raise', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Hip Thrust', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Bulgarian Split Squat', activity_type: 'weights', muscle_group: 'legs', created_at: new Date().toISOString() },
  // Shoulders
  { id: uid(), name: 'Overhead Press', activity_type: 'weights', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  { id: uid(), name: 'Lateral Raise', activity_type: 'weights', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  { id: uid(), name: 'Front Raise', activity_type: 'weights', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  { id: uid(), name: 'Rear Delt Fly', activity_type: 'weights', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  { id: uid(), name: 'Arnold Press', activity_type: 'weights', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  { id: uid(), name: 'Upright Row', activity_type: 'weights', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  // Arms
  { id: uid(), name: 'Barbell Curl', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Hammer Curl', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Preacher Curl', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Tricep Pushdown', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Skull Crusher', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Dips', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Close-Grip Bench Press', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  { id: uid(), name: 'Overhead Tricep Extension', activity_type: 'weights', muscle_group: 'arms', created_at: new Date().toISOString() },
  // Core
  { id: uid(), name: 'Plank', activity_type: 'weights', muscle_group: 'core', created_at: new Date().toISOString() },
  { id: uid(), name: 'Crunches', activity_type: 'weights', muscle_group: 'core', created_at: new Date().toISOString() },
  { id: uid(), name: 'Hanging Leg Raise', activity_type: 'weights', muscle_group: 'core', created_at: new Date().toISOString() },
  { id: uid(), name: 'Cable Crunch', activity_type: 'weights', muscle_group: 'core', created_at: new Date().toISOString() },
  { id: uid(), name: 'Russian Twist', activity_type: 'weights', muscle_group: 'core', created_at: new Date().toISOString() },
  { id: uid(), name: 'Ab Wheel', activity_type: 'weights', muscle_group: 'core', created_at: new Date().toISOString() },
  // Kettlebell
  { id: uid(), name: 'Kettlebell Swing', activity_type: 'kettlebell', muscle_group: 'full-body', created_at: new Date().toISOString() },
  { id: uid(), name: 'Kettlebell Clean', activity_type: 'kettlebell', muscle_group: 'full-body', created_at: new Date().toISOString() },
  { id: uid(), name: 'Kettlebell Press', activity_type: 'kettlebell', muscle_group: 'shoulders', created_at: new Date().toISOString() },
  { id: uid(), name: 'Kettlebell Snatch', activity_type: 'kettlebell', muscle_group: 'full-body', created_at: new Date().toISOString() },
  { id: uid(), name: 'Turkish Get-Up', activity_type: 'kettlebell', muscle_group: 'full-body', created_at: new Date().toISOString() },
  { id: uid(), name: 'Goblet Squat', activity_type: 'kettlebell', muscle_group: 'legs', created_at: new Date().toISOString() },
  { id: uid(), name: 'Kettlebell Row', activity_type: 'kettlebell', muscle_group: 'back', created_at: new Date().toISOString() },
  { id: uid(), name: 'Figure 8', activity_type: 'kettlebell', muscle_group: 'core', created_at: new Date().toISOString() },
]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function timeOn(dateStr: string, hour: number): string {
  return new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`).toISOString()
}

export async function seedIfEmpty() {
  const count = await db.exercises.count()
  if (count > 0) return

  await db.exercises.bulkAdd(exercises)

  const exByName = Object.fromEntries(exercises.map(e => [e.name, e]))

  // Mock sessions — spread over last 3 weeks
  const sessions: Session[] = [
    { id: uid(), date: daysAgo(1), activity_type: 'weights', start_time: timeOn(daysAgo(1), 7), end_time: timeOn(daysAgo(1), 8), duration_minutes: 60, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(3), activity_type: 'swim', start_time: timeOn(daysAgo(3), 6), end_time: timeOn(daysAgo(3), 7), duration_minutes: 45, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(5), activity_type: 'weights', start_time: timeOn(daysAgo(5), 18), end_time: timeOn(daysAgo(5), 19), duration_minutes: 55, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(7), activity_type: 'yoga', start_time: timeOn(daysAgo(7), 7), end_time: timeOn(daysAgo(7), 8), duration_minutes: 60, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(9), activity_type: 'weights', start_time: timeOn(daysAgo(9), 17), end_time: timeOn(daysAgo(9), 18), duration_minutes: 50, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(11), activity_type: 'swim', start_time: timeOn(daysAgo(11), 6), end_time: timeOn(daysAgo(11), 7), duration_minutes: 40, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(14), activity_type: 'weights', start_time: timeOn(daysAgo(14), 8), end_time: timeOn(daysAgo(14), 9), duration_minutes: 65, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(16), activity_type: 'kettlebell', start_time: timeOn(daysAgo(16), 7), end_time: timeOn(daysAgo(16), 8), duration_minutes: 45, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(18), activity_type: 'yoga', start_time: timeOn(daysAgo(18), 8), end_time: timeOn(daysAgo(18), 9), duration_minutes: 60, status: 'completed', synced: false },
    { id: uid(), date: daysAgo(21), activity_type: 'weights', start_time: timeOn(daysAgo(21), 17), end_time: timeOn(daysAgo(21), 18), duration_minutes: 60, status: 'completed', synced: false },
  ]

  await db.sessions.bulkAdd(sessions)

  const benchId = exByName['Bench Press']?.id
  const squatId = exByName['Squat']?.id
  const deadliftId = exByName['Deadlift']?.id
  const ohpId = exByName['Overhead Press']?.id
  const pullupId = exByName['Pull-up']?.id

  if (benchId && squatId && deadliftId && ohpId && pullupId) {
    const weightEntries: WeightEntry[] = [
      // Session 0 (yesterday) — chest/shoulders
      { id: uid(), session_id: sessions[0].id, exercise_id: benchId, set_number: 1, weight_kg: 80, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[0].id, exercise_id: benchId, set_number: 2, weight_kg: 80, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[0].id, exercise_id: benchId, set_number: 3, weight_kg: 85, reps: 6, order_index: 0 },
      { id: uid(), session_id: sessions[0].id, exercise_id: ohpId, set_number: 1, weight_kg: 60, reps: 8, order_index: 1 },
      { id: uid(), session_id: sessions[0].id, exercise_id: ohpId, set_number: 2, weight_kg: 60, reps: 8, order_index: 1 },
      { id: uid(), session_id: sessions[0].id, exercise_id: ohpId, set_number: 3, weight_kg: 65, reps: 6, order_index: 1 },
      // Session 2 (5 days ago) — legs
      { id: uid(), session_id: sessions[2].id, exercise_id: squatId, set_number: 1, weight_kg: 100, reps: 5, order_index: 0 },
      { id: uid(), session_id: sessions[2].id, exercise_id: squatId, set_number: 2, weight_kg: 100, reps: 5, order_index: 0 },
      { id: uid(), session_id: sessions[2].id, exercise_id: squatId, set_number: 3, weight_kg: 105, reps: 4, order_index: 0 },
      { id: uid(), session_id: sessions[2].id, exercise_id: deadliftId, set_number: 1, weight_kg: 130, reps: 5, order_index: 1 },
      { id: uid(), session_id: sessions[2].id, exercise_id: deadliftId, set_number: 2, weight_kg: 130, reps: 5, order_index: 1 },
      // Session 4 (9 days ago) — pull
      { id: uid(), session_id: sessions[4].id, exercise_id: pullupId, set_number: 1, weight_kg: 0, reps: 10, order_index: 0 },
      { id: uid(), session_id: sessions[4].id, exercise_id: pullupId, set_number: 2, weight_kg: 0, reps: 9, order_index: 0 },
      { id: uid(), session_id: sessions[4].id, exercise_id: pullupId, set_number: 3, weight_kg: 0, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[4].id, exercise_id: deadliftId, set_number: 1, weight_kg: 125, reps: 5, order_index: 1 },
      { id: uid(), session_id: sessions[4].id, exercise_id: deadliftId, set_number: 2, weight_kg: 125, reps: 5, order_index: 1 },
      // Session 6 (14 days ago)
      { id: uid(), session_id: sessions[6].id, exercise_id: benchId, set_number: 1, weight_kg: 77.5, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[6].id, exercise_id: benchId, set_number: 2, weight_kg: 77.5, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[6].id, exercise_id: benchId, set_number: 3, weight_kg: 80, reps: 6, order_index: 0 },
      { id: uid(), session_id: sessions[6].id, exercise_id: squatId, set_number: 1, weight_kg: 97.5, reps: 5, order_index: 1 },
      { id: uid(), session_id: sessions[6].id, exercise_id: squatId, set_number: 2, weight_kg: 97.5, reps: 5, order_index: 1 },
      { id: uid(), session_id: sessions[6].id, exercise_id: squatId, set_number: 3, weight_kg: 100, reps: 4, order_index: 1 },
      // Session 9 (21 days ago)
      { id: uid(), session_id: sessions[9].id, exercise_id: benchId, set_number: 1, weight_kg: 75, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[9].id, exercise_id: benchId, set_number: 2, weight_kg: 75, reps: 8, order_index: 0 },
      { id: uid(), session_id: sessions[9].id, exercise_id: deadliftId, set_number: 1, weight_kg: 120, reps: 5, order_index: 1 },
      { id: uid(), session_id: sessions[9].id, exercise_id: deadliftId, set_number: 2, weight_kg: 120, reps: 5, order_index: 1 },
    ]
    await db.weightEntries.bulkAdd(weightEntries)
  }

  const swimEntries: SwimEntry[] = [
    { id: uid(), session_id: sessions[1].id, duration_minutes: 45, distance_meters: 1500, stroke_type: 'freestyle' },
    { id: uid(), session_id: sessions[5].id, duration_minutes: 40, distance_meters: 1200, stroke_type: 'freestyle' },
  ]
  await db.swimEntries.bulkAdd(swimEntries)

  const yogaEntries: YogaEntry[] = [
    { id: uid(), session_id: sessions[3].id, style: 'vinyasa', duration_minutes: 60, intensity: 4 },
    { id: uid(), session_id: sessions[8].id, style: 'yin', duration_minutes: 60, intensity: 2 },
  ]
  await db.yogaEntries.bulkAdd(yogaEntries)
}
