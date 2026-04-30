'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Session, StrokeType, SwimEntry } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const STROKES: { value: StrokeType; label: string }[] = [
  { value: 'freestyle', label: 'Freestyle' },
  { value: 'backstroke', label: 'Backstroke' },
  { value: 'breaststroke', label: 'Breaststroke' },
  { value: 'butterfly', label: 'Butterfly' },
  { value: 'mixed', label: 'Mixed' },
]

interface Props { session: Session }

export function SwimLogger({ session }: Props) {
  const entry = useLiveQuery(
    () => db.swimEntries.where('session_id').equals(session.id).first(),
    [session.id]
  )

  const ensure = async () => {
    const existing = await db.swimEntries.where('session_id').equals(session.id).first()
    if (existing) return existing
    const newEntry = {
      id: crypto.randomUUID(),
      session_id: session.id,
      duration_minutes: 0,
      stroke_type: 'freestyle' as StrokeType,
    }
    await db.swimEntries.add(newEntry)
    return newEntry
  }

  const update = async (patch: Partial<SwimEntry>) => {
    const e = await ensure()
    await db.swimEntries.update(e.id, patch)
  }

  return (
    <Card className="rounded-2xl border-border">
      <CardContent className="space-y-5 pt-5 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={entry?.duration_minutes ?? ''}
              onChange={e => update({ duration_minutes: parseInt(e.target.value) || 0 })}
              placeholder="45"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Distance (m)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={entry?.distance_meters ?? ''}
              onChange={e => update({ distance_meters: parseInt(e.target.value) || undefined })}
              placeholder="1500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Laps</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={entry?.laps ?? ''}
              onChange={e => update({ laps: parseInt(e.target.value) || undefined })}
              placeholder="60"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Stroke</Label>
            <Select
              value={entry?.stroke_type ?? 'freestyle'}
              onValueChange={v => update({ stroke_type: v as StrokeType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STROKES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Input
            value={entry?.notes ?? ''}
            onChange={e => update({ notes: e.target.value })}
            placeholder="Optional notes..."
          />
        </div>
      </CardContent>
    </Card>
  )
}
