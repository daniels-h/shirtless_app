'use client'
import { useState, useRef } from 'react'
import { db } from '@/lib/db'
import type { Exercise, WeightEntry } from '@/lib/types'
import type { WeightUnit } from '@/lib/types'
import { toDisplayWeight, toKg, weightStep, formatWeight } from '@/lib/units'
import { Button } from '@/components/ui/button'
import { Minus, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  exercise: Exercise
  sets: WeightEntry[]
  unit: WeightUnit
  onDelete: () => void
}

export function ExerciseCard({ exercise, sets, unit, onDelete }: Props) {
  const [editingCell, setEditingCell] = useState<{ setId: string; field: 'weight' | 'reps' } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addSet = async () => {
    const lastSet = sets[sets.length - 1]
    const newSet: WeightEntry = {
      id: crypto.randomUUID(),
      session_id: lastSet?.session_id ?? '',
      exercise_id: exercise.id,
      set_number: (lastSet?.set_number ?? 0) + 1,
      weight_kg: lastSet?.weight_kg ?? 20,
      reps: lastSet?.reps ?? 8,
      order_index: sets[0]?.order_index ?? 0,
    }
    await db.weightEntries.add(newSet)
  }

  const deleteSet = async (setId: string) => {
    const s = sets.find(s => s.id === setId)
    await db.weightEntries.delete(setId)
    toast('Set removed', {
      action: {
        label: 'Undo',
        onClick: async () => { if (s) await db.weightEntries.add(s) },
      },
      duration: 4000,
    })
  }

  const updateWeight = async (setId: string, displayVal: number) => {
    const kg = toKg(displayVal, unit)
    await db.weightEntries.update(setId, { weight_kg: kg })
  }

  const updateReps = async (setId: string, reps: number) => {
    if (reps < 1) return
    await db.weightEntries.update(setId, { reps })
  }

  const step = weightStep(unit)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-muted-foreground/50" />
          <span className="font-semibold text-sm">{exercise.name}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Sets table */}
      <div className="px-4 py-2">
        {/* Column headers */}
        <div className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 mb-1 px-1">
          <span className="text-xs text-muted-foreground text-center">Set</span>
          <span className="text-xs text-muted-foreground text-center">{unit === 'kg' ? 'kg' : 'lbs'}</span>
          <span className="text-xs text-muted-foreground text-center">Reps</span>
          <span />
        </div>

        <div className="space-y-1.5">
          {sets.map((s, i) => {
            const dispWeight = toDisplayWeight(s.weight_kg, unit)
            return (
              <div key={s.id} className="grid grid-cols-[32px_1fr_1fr_32px] gap-2 items-center">
                <span className="text-xs text-muted-foreground text-center font-mono">{i + 1}</span>

                {/* Weight cell */}
                <CellInput
                  value={dispWeight}
                  step={step}
                  min={0}
                  onChange={v => updateWeight(s.id, v)}
                  format={v => String(v)}
                />

                {/* Reps cell */}
                <CellInput
                  value={s.reps}
                  step={1}
                  min={1}
                  onChange={v => updateReps(s.id, v)}
                  format={v => String(v)}
                  integer
                />

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground/50 hover:text-destructive"
                  onClick={() => deleteSet(s.id)}
                >
                  <Minus size={12} />
                </Button>
              </div>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-3 gap-1.5 text-muted-foreground text-xs h-8"
          onClick={addSet}
        >
          <Plus size={14} />
          Add Set
        </Button>
      </div>
    </div>
  )
}

function CellInput({
  value,
  step,
  min,
  onChange,
  format,
  integer = false,
}: {
  value: number
  step: number
  min: number
  onChange: (v: number) => void
  format: (v: number) => string
  integer?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const round = (v: number) => integer ? Math.round(v) : Math.round(v / step) * step

  if (editing) {
    return (
      <input
        autoFocus
        className="w-full rounded-xl border-2 border-ring bg-white/[0.09] px-2 py-2 text-center text-sm font-mono focus:outline-none"
        value={draft}
        inputMode={integer ? 'numeric' : 'decimal'}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          const v = parseFloat(draft)
          if (!isNaN(v) && v >= min) onChange(round(v))
          setEditing(false)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') setEditing(false)
        }}
      />
    )
  }

  return (
    <div className="flex items-center rounded-xl border border-input bg-white/[0.06] overflow-hidden">
      <button
        className="px-2 py-2.5 text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors"
        onClick={() => onChange(Math.max(min, round(value - step)))}
      >
        <Minus size={11} />
      </button>
      <button
        className="flex-1 text-center text-sm font-mono py-2.5 font-medium hover:bg-white/[0.04] transition-colors"
        onClick={() => { setDraft(format(value)); setEditing(true) }}
      >
        {format(value)}
      </button>
      <button
        className="px-1.5 py-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        onClick={() => onChange(round(value + step))}
      >
        <Plus size={10} />
      </button>
    </div>
  )
}
