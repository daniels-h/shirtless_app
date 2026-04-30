'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { ACTIVITY_COLORS, ACTIVITY_LABELS, type ActivityType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function CalendarTab() {
  const router = useRouter()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const monthStart = isoDate(year, month, 1)
  const nextMonth = month === 11 ? isoDate(year + 1, 0, 1) : isoDate(year, month + 1, 1)

  const sessions = useLiveQuery(
    () => db.sessions.where('date').between(monthStart, nextMonth, true, false).toArray(),
    [monthStart]
  )

  const byDate = (sessions ?? []).reduce<Record<string, ActivityType[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s.activity_type)
    return acc
  }, {})

  const activityCounts = (sessions ?? []).reduce<Record<ActivityType, number>>((acc, s) => {
    acc[s.activity_type] = (acc[s.activity_type] ?? 0) + 1
    return acc
  }, {} as Record<ActivityType, number>)

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const firstDow = (firstDay.getDay() + 6) % 7 // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = now.toISOString().split('T')[0]

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonthNav = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const handleDayTap = (dateStr: string) => {
    const daySessions = (sessions ?? []).filter(s => s.date === dateStr)
    if (daySessions.length === 1) router.push(`/log?id=${daySessions[0].id}`)
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-5">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
          <ChevronLeft size={18} />
        </Button>
        <span className="text-sm font-semibold">{monthLabel}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonthNav}>
          <ChevronRight size={18} />
        </Button>
      </div>

      {/* Monthly summary */}
      <p className="text-xs text-muted-foreground text-center">
        {sessions?.length ?? 0} sessions
        {Object.entries(activityCounts).map(([t, n]) => ` · ${n} ${ACTIVITY_LABELS[t as ActivityType].toLowerCase()}`)}
      </p>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map(d => (
          <span key={d} className="text-center text-xs text-muted-foreground py-1">{d[0]}</span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const dateStr = isoDate(year, month, day)
          const activities = byDate[dateStr] ?? []
          const trained = activities.length > 0
          const isToday = dateStr === todayStr

          return (
            <button
              key={i}
              onClick={() => trained && handleDayTap(dateStr)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 rounded-xl transition-colors',
                trained && 'hover:bg-muted active:scale-95'
              )}
            >
              <span className={cn(
                'w-7 h-7 flex items-center justify-center rounded-full text-sm',
                isToday && 'border border-primary',
                trained && 'font-medium text-foreground',
                !trained && 'text-muted-foreground',
              )}>
                {day}
              </span>
              {trained && (
                <div className="flex gap-0.5">
                  {activities.slice(0, 3).map((a, j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: ACTIVITY_COLORS[a] }}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Stats */}
      <Card className="rounded-2xl border-border mt-4">
        <CardContent className="grid grid-cols-2 gap-4 pt-4 pb-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Avg per week</p>
            <p className="text-lg font-semibold">
              {sessions ? (sessions.length / (daysInMonth / 7)).toFixed(1) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">This month</p>
            <p className="text-lg font-semibold">{sessions?.length ?? 0}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
