'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Session, YogaStyle, YogaEntry } from '@/lib/types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STYLES: { value: YogaStyle; label: string }[] = [
  { value: 'vinyasa', label: 'Vinyasa' },
  { value: 'yin', label: 'Yin' },
  { value: 'hatha', label: 'Hatha' },
  { value: 'power', label: 'Power' },
  { value: 'other', label: 'Other' },
]

interface Props { session: Session }

export function YogaLogger({ session }: Props) {
  const entry = useLiveQuery(
    () => db.yogaEntries.where('session_id').equals(session.id).first(),
    [session.id]
  )

  const ensure = async () => {
    const existing = await db.yogaEntries.where('session_id').equals(session.id).first()
    if (existing) return existing
    const newEntry = {
      id: crypto.randomUUID(),
      session_id: session.id,
      style: 'vinyasa' as YogaStyle,
      duration_minutes: 60,
      intensity: 3,
    }
    await db.yogaEntries.add(newEntry)
    return newEntry
  }

  const update = async (patch: Partial<YogaEntry>) => {
    const e = await ensure()
    await db.yogaEntries.update(e.id, patch)
  }

  return (
    <Card className="rounded-2xl border-border">
      <CardContent className="space-y-5 pt-5 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Style</Label>
            <Select
              value={entry?.style ?? 'vinyasa'}
              onValueChange={v => update({ style: v as YogaStyle })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={entry?.duration_minutes ?? ''}
              onChange={e => update({ duration_minutes: parseInt(e.target.value) || 0 })}
              placeholder="60"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Intensity</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => update({ intensity: n })}
                className={cn(
                  'flex-1 rounded-xl py-3 text-sm font-semibold border-2 transition-all',
                  (entry?.intensity ?? 3) === n
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {n}
              </button>
            ))}
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
