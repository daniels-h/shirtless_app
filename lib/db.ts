import Dexie, { type Table } from 'dexie'
import type {
  Exercise,
  Session,
  WeightEntry,
  SwimEntry,
  KettlebellEntry,
  YogaEntry,
} from './types'

export class MovementDB extends Dexie {
  exercises!: Table<Exercise>
  sessions!: Table<Session>
  weightEntries!: Table<WeightEntry>
  swimEntries!: Table<SwimEntry>
  kettlebellEntries!: Table<KettlebellEntry>
  yogaEntries!: Table<YogaEntry>

  constructor() {
    super('MovementDB')
    this.version(1).stores({
      exercises: 'id, activity_type, muscle_group, name',
      sessions: 'id, date, activity_type, status',
      weightEntries: 'id, session_id, exercise_id, order_index',
      swimEntries: 'id, session_id',
      kettlebellEntries: 'id, session_id',
      yogaEntries: 'id, session_id',
    })
  }
}

export const db = new MovementDB()
