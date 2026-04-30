'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { formatWeight } from '@/lib/units'
import { useUnit } from '@/lib/hooks/useUnit'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { WeightEntry } from '@/lib/types'

type Metric = 'e1rm' | 'maxWeight' | 'volume'
type Range = '1m' | '3m' | '6m' | '1y' | 'all'

const METRIC_LABELS: Record<Metric, string> = {
  e1rm: 'Est. 1RM',
  maxWeight: 'Max Weight',
  volume: 'Volume',
}

const RANGES: { value: Range; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
]

function e1rm(weight: number, reps: number) {
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

function rangeStart(r: Range): string {
  const d = new Date()
  if (r === '1m') d.setMonth(d.getMonth() - 1)
  else if (r === '3m') d.setMonth(d.getMonth() - 3)
  else if (r === '6m') d.setMonth(d.getMonth() - 6)
  else if (r === '1y') d.setFullYear(d.getFullYear() - 1)
  else d.setFullYear(2000)
  return d.toISOString().split('T')[0]
}

export function StrengthTab() {
  const { unit } = useUnit()
  const [exerciseId, setExerciseId] = useState<string>('')
  const [metric, setMetric] = useState<Metric>('e1rm')
  const [range, setRange] = useState<Range>('3m')

  const exercises = useLiveQuery(
    () => db.exercises.where('activity_type').equals('weights').sortBy('name'),
    []
  )

  const chartData = useLiveQuery(async () => {
    if (!exerciseId) return []
    const start = rangeStart(range)
    const entries = await db.weightEntries.where('exercise_id').equals(exerciseId).toArray()
    const sessions = await db.sessions.where('date').aboveOrEqual(start).toArray()
    const sessionDates = new Map(sessions.map(s => [s.id, s.date]))

    const bySession = new Map<string, WeightEntry[]>()
    for (const e of entries) {
      if (!sessionDates.has(e.session_id)) continue
      if (!bySession.has(e.session_id)) bySession.set(e.session_id, [])
      bySession.get(e.session_id)!.push(e)
    }

    return [...bySession.entries()]
      .map(([sid, sets]) => {
        const date = sessionDates.get(sid)!
        const maxE1rm = Math.max(...sets.map(s => e1rm(s.weight_kg, s.reps)))
        const maxW = Math.max(...sets.map(s => s.weight_kg))
        const vol = sets.reduce((acc, s) => acc + s.weight_kg * s.reps, 0)
        return {
          date,
          e1rm: Math.round(maxE1rm * 10) / 10,
          maxWeight: maxW,
          volume: Math.round(vol),
        }
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [exerciseId, range])

  const allEntries = useLiveQuery<WeightEntry[]>(
    () => exerciseId ? db.weightEntries.where('exercise_id').equals(exerciseId).toArray() : Promise.resolve([]),
    [exerciseId]
  )

  const prs = (() => {
    if (!allEntries?.length) return null
    const heaviest = allEntries.reduce((a, b) => b.weight_kg > a.weight_kg ? b : a)
    const bestE1rm = allEntries.reduce((a, b) => e1rm(b.weight_kg, b.reps) > e1rm(a.weight_kg, a.reps) ? b : a)
    return {
      heaviest,
      bestE1rm: e1rm(bestE1rm.weight_kg, bestE1rm.reps),
      heaviestE1rm: e1rm(heaviest.weight_kg, heaviest.reps),
    }
  })()

  const selectedExercise = exercises?.find(e => e.id === exerciseId)

  return (
    <div className="space-y-5">
      {/* Exercise picker */}
      <Select value={exerciseId} onValueChange={v => setExerciseId(v ?? '')}>
        <SelectTrigger className="rounded-xl">
          <SelectValue placeholder="Select an exercise..." />
        </SelectTrigger>
        <SelectContent>
          {(exercises ?? []).map(e => (
            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {exerciseId && (
        <>
          {/* Metric toggle */}
          <div className="flex rounded-xl border border-border overflow-hidden text-sm">
            {(Object.keys(METRIC_LABELS) as Metric[]).map(m => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  'flex-1 py-2 font-medium transition-colors',
                  metric === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {METRIC_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Chart */}
          <Card className="rounded-2xl border-border">
            <CardContent className="pt-4 pb-2 px-2">
              {/* Range selector */}
              <div className="flex justify-end gap-1 mb-3 pr-2">
                {RANGES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setRange(r.value)}
                    className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium transition-colors',
                      range === r.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={d => {
                        const date = new Date(d + 'T12:00:00')
                        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                      }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                      tickFormatter={v => unit === 'lbs' ? Math.round(v * 2.20462).toString() : v.toString()}
                    />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      formatter={(v) => [formatWeight(Number(v), unit), METRIC_LABELS[metric]]}
                      labelFormatter={d => new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                    />
                    <Line
                      type="monotone"
                      dataKey={metric}
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#3B82F6' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                  No data for this range
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRs */}
          {prs && (
            <Card className="rounded-2xl border-border">
              <CardContent className="pt-4 pb-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Heaviest</p>
                  <p className="text-base font-semibold">{formatWeight(prs.heaviest.weight_kg, unit)}</p>
                  <p className="text-xs text-muted-foreground">×{prs.heaviest.reps}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Best 1RM</p>
                  <p className="text-base font-semibold">{formatWeight(prs.bestE1rm, unit)}</p>
                  <p className="text-xs text-muted-foreground">estimated</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                  <p className="text-base font-semibold">{new Set(allEntries?.map(e => e.session_id)).size}</p>
                  <p className="text-xs text-muted-foreground">total</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!exerciseId && (
        <p className="text-center text-muted-foreground text-sm pt-12">
          Pick an exercise to see your progress
        </p>
      )}
    </div>
  )
}
