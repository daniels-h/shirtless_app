'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Session, KettlebellEntry } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props { session: Session }

export function KettlebellLogger({ session }: Props) {
  const entries = useLiveQuery(
    () => db.kettlebellEntries.where('session_id').equals(session.id).toArray(),
    [session.id]
  )
  const firstEntry = entries?.[0]
  const mode = firstEntry?.mode ?? 'circuit'

  const ensure = async (m: 'set-based' | 'circuit') => {
    const existing = await db.kettlebellEntries.where('session_id').equals(session.id).first()
    if (existing) return existing
    const e = { id: crypto.randomUUID(), session_id: session.id, mode: m }
    await db.kettlebellEntries.add(e)
    return e
  }

  const update = async (patch: Partial<KettlebellEntry>) => {
    const e = await ensure(mode)
    await db.kettlebellEntries.update(e.id, patch)
  }

  const switchMode = async (m: 'set-based' | 'circuit') => {
    if (firstEntry) await db.kettlebellEntries.update(firstEntry.id, { mode: m })
    else await ensure(m)
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-border overflow-hidden">
        {(['circuit', 'set-based'] as const).map(m => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            )}
          >
            {m === 'circuit' ? 'Circuit' : 'Set-Based'}
          </button>
        ))}
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="space-y-5 pt-5 pb-6">
          {mode === 'circuit' ? (
            <>
              <div className="space-y-1.5">
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={firstEntry?.duration_minutes ?? ''}
                  onChange={e => update({ duration_minutes: parseInt(e.target.value) || 0 })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Notes / Exercises</Label>
                <Input
                  value={firstEntry?.notes ?? ''}
                  onChange={e => update({ notes: e.target.value })}
                  placeholder="e.g. Swings 3×20, Turkish get-ups 3×5..."
                />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={firstEntry?.weight_kg ?? ''}
                  onChange={e => update({ weight_kg: parseFloat(e.target.value) || 0 })}
                  placeholder="24"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sets</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={firstEntry?.set_number ?? ''}
                  onChange={e => update({ set_number: parseInt(e.target.value) || 0 })}
                  placeholder="3"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Reps</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={firstEntry?.reps ?? ''}
                  onChange={e => update({ reps: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
