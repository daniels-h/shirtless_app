'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

function getWeekBounds() {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  }
}


export function StatsWidgets() {
  const { start, end } = getWeekBounds()

  const weekSessions = useLiveQuery(
    () => db.sessions
      .where('date')
      .between(start, end, true, true)
      .filter(s => s.status === 'completed')
      .count(),
    [start, end]
  )

  const monthStart = new Date()
  monthStart.setDate(1)
  const monthStartStr = monthStart.toISOString().split('T')[0]

  const monthSessions = useLiveQuery(
    () => db.sessions
      .where('date')
      .aboveOrEqual(monthStartStr)
      .filter(s => s.status === 'completed')
      .count(),
    [monthStartStr]
  )

  const monthName = new Date().toLocaleDateString('en-GB', { month: 'long' })

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-border bg-card px-4 py-4 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">This week</span>
        <span className="text-3xl font-bold tabular-nums">{weekSessions ?? '—'}</span>
        <span className="text-xs text-muted-foreground">sessions</span>
      </div>
      <div className="rounded-2xl border border-border bg-card px-4 py-4 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{monthName}</span>
        <span className="text-3xl font-bold tabular-nums">{monthSessions ?? '—'}</span>
        <span className="text-xs text-muted-foreground">sessions</span>
      </div>
    </div>
  )
}
