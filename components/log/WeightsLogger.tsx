'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Session, Exercise } from '@/lib/types'
import { useUnit } from '@/lib/hooks/useUnit'
import { ExerciseCard } from './ExerciseCard'
import { ExerciseSearch } from './ExerciseSearch'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  session: Session
}

export function WeightsLogger({ session }: Props) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { unit } = useUnit()

  const entries = useLiveQuery(
    () => db.weightEntries.where('session_id').equals(session.id).toArray(),
    [session.id]
  )

  const exerciseIds = [...new Set((entries ?? []).map(e => e.exercise_id))]
  const exercises = useLiveQuery(
    () => db.exercises.bulkGet(exerciseIds),
    [JSON.stringify(exerciseIds)]
  )

  const exerciseOrder = useLiveQuery(async () => {
    if (!entries?.length) return []
    const orderMap = new Map<string, number>()
    for (const e of entries) {
      if (!orderMap.has(e.exercise_id)) orderMap.set(e.exercise_id, e.order_index)
    }
    return [...orderMap.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id)
  }, [JSON.stringify(entries)])

  const handleAddExercise = async (exercise: Exercise) => {
    const maxOrder = Math.max(-1, ...(entries ?? []).map(e => e.order_index))
    const set = {
      id: crypto.randomUUID(),
      session_id: session.id,
      exercise_id: exercise.id,
      set_number: 1,
      weight_kg: 20,
      reps: 8,
      order_index: maxOrder + 1,
    }
    await db.weightEntries.add(set)
  }

  const handleDeleteExercise = async (exerciseId: string) => {
    const toDelete = (entries ?? []).filter(e => e.exercise_id === exerciseId)
    const ids = toDelete.map(e => e.id)
    await db.weightEntries.bulkDelete(ids)
    toast('Exercise removed', {
      action: {
        label: 'Undo',
        onClick: () => db.weightEntries.bulkAdd(toDelete),
      },
      duration: 4000,
    })
  }

  const orderedExercises = (exerciseOrder ?? [])
    .map(id => (exercises ?? []).find(e => e?.id === id))
    .filter(Boolean) as Exercise[]

  return (
    <div className="flex flex-col gap-4">
      {orderedExercises.map(exercise => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          sets={(entries ?? []).filter(e => e.exercise_id === exercise.id).sort((a, b) => a.set_number - b.set_number)}
          unit={unit}
          onDelete={() => handleDeleteExercise(exercise.id)}
        />
      ))}

      <Button
        variant="outline"
        className="w-full gap-2 rounded-2xl h-12 border-dashed"
        onClick={() => setSearchOpen(true)}
      >
        <Plus size={16} />
        Add Exercise
      </Button>

      <ExerciseSearch
        open={searchOpen}
        activityType="weights"
        onSelect={handleAddExercise}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  )
}
