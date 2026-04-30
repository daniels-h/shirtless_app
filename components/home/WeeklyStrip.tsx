'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { ACTIVITY_COLORS, type ActivityType } from '@/lib/types'
import { cn } from '@/lib/utils'

function getWeekDays() {
  const today = new Date()
  const dow = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dow + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function WeeklyStrip() {
  const days = getWeekDays()
  const startDate = days[0].toISOString().split('T')[0]
  const endDate = days[6].toISOString().split('T')[0]

  const sessions = useLiveQuery(
    () => db.sessions.where('date').between(startDate, endDate, true, true).toArray(),
    [startDate, endDate]
  )

  const sessionsByDate = (sessions ?? []).reduce<Record<string, ActivityType[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = []
    acc[s.date].push(s.activity_type)
    return acc
  }, {})

  const todayStr = new Date().toISOString().split('T')[0]

  const weekTotal = sessions?.length ?? 0
  const monthStart = new Date()
  monthStart.setDate(1)

  const monthSessions = useLiveQuery(
    () => db.sessions
      .where('date')
      .aboveOrEqual(monthStart.toISOString().split('T')[0])
      .count(),
    []
  )

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        {days.map((day, i) => {
          const dateStr = day.toISOString().split('T')[0]
          const isToday = dateStr === todayStr
          const activities = sessionsByDate[dateStr] ?? []
          const trained = activities.length > 0

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className={cn('text-xs', isToday ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {DAY_LABELS[i]}
              </span>
              <div className="relative flex flex-col items-center gap-0.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all',
                    isToday && !trained ? 'border-primary border-dashed' : 'border-transparent',
                    trained ? 'border-0' : 'bg-muted/40',
                  )}
                  style={trained ? { backgroundColor: `${ACTIVITY_COLORS[activities[0]]}33` } : {}}
                >
                  {trained ? (
                    <span className="text-base">{activities.length > 1 ? '✦' : '●'}</span>
                  ) : null}
                </div>
                {activities.length > 1 && (
                  <div className="flex gap-0.5">
                    {activities.map((a, j) => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: ACTIVITY_COLORS[a] }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <span className={cn('text-xs font-mono', isToday ? 'text-foreground' : 'text-muted-foreground/60')}>
                {day.getDate()}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center">
        {weekTotal} session{weekTotal !== 1 ? 's' : ''} this week
        {monthSessions ? ` · ${monthSessions} this month` : ''}
      </p>
    </div>
  )
}
