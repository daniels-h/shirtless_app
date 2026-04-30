'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { ACTIVITY_COLORS, ACTIVITY_LABELS, type ActivityType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'

function formatDuration(mins?: number) {
  if (!mins) return null
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function formatDay(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function groupByMonth(sessions: any[]) {
  const groups: Record<string, any[]> = {}
  for (const s of sessions) {
    const key = s.date.slice(0, 7)
    if (!groups[key]) groups[key] = []
    groups[key].push(s)
  }
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
}

function monthLabel(key: string) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1)
    .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function HistoryTab() {
  const router = useRouter()

  const sessions = useLiveQuery(
    () => db.sessions.orderBy('date').reverse().filter(s => s.status === 'completed').toArray(),
    []
  )

  const handleDelete = async (session: any) => {
    const [weightEntries, swimEntries, yogaEntries, kbEntries] = await Promise.all([
      db.weightEntries.where('session_id').equals(session.id).toArray(),
      db.swimEntries.where('session_id').equals(session.id).toArray(),
      db.yogaEntries.where('session_id').equals(session.id).toArray(),
      db.kettlebellEntries.where('session_id').equals(session.id).toArray(),
    ])
    await Promise.all([
      db.sessions.delete(session.id),
      db.weightEntries.where('session_id').equals(session.id).delete(),
      db.swimEntries.where('session_id').equals(session.id).delete(),
      db.yogaEntries.where('session_id').equals(session.id).delete(),
      db.kettlebellEntries.where('session_id').equals(session.id).delete(),
    ])
    toast('Session deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          await db.sessions.add(session)
          await Promise.all([
            weightEntries.length && db.weightEntries.bulkAdd(weightEntries),
            swimEntries.length && db.swimEntries.bulkAdd(swimEntries),
            yogaEntries.length && db.yogaEntries.bulkAdd(yogaEntries),
            kbEntries.length && db.kettlebellEntries.bulkAdd(kbEntries),
          ])
        },
      },
      duration: 4000,
    })
  }

  if (!sessions?.length) {
    return <p className="text-center text-muted-foreground text-sm pt-16">No sessions yet</p>
  }

  const groups = groupByMonth(sessions)

  return (
    <ScrollArea className="h-[calc(100vh-260px)]">
      <div className="space-y-7 pr-1">
        {groups.map(([monthKey, monthSessions]) => (
          <div key={monthKey}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2 px-1">
              {monthLabel(monthKey)}
            </p>
            <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
              {monthSessions.map(session => (
                <SessionRow
                  key={session.id}
                  session={session}
                  onTap={() => router.push(`/log?id=${session.id}`)}
                  onDelete={() => handleDelete(session)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function SessionRow({ session, onTap, onDelete }: {
  session: any
  onTap: () => void
  onDelete: () => void
}) {
  const color = ACTIVITY_COLORS[session.activity_type as ActivityType]

  const summary = useLiveQuery(async () => {
    if (session.activity_type === 'weights') {
      const entries = await db.weightEntries.where('session_id').equals(session.id).toArray()
      const count = new Set(entries.map((e: any) => e.exercise_id)).size
      return `${count} exercise${count !== 1 ? 's' : ''}`
    }
    if (session.activity_type === 'swim') {
      const e = await db.swimEntries.where('session_id').equals(session.id).first()
      return e?.distance_meters ? `${(e.distance_meters / 1000).toFixed(1)} km` : null
    }
    if (session.activity_type === 'yoga') {
      const e = await db.yogaEntries.where('session_id').equals(session.id).first()
      return e ? `${e.style.charAt(0).toUpperCase() + e.style.slice(1)}` : null
    }
    if (session.activity_type === 'kettlebell') {
      const e = await db.kettlebellEntries.where('session_id').equals(session.id).first()
      return e?.mode === 'circuit' ? 'Circuit' : 'Set-based'
    }
    return null
  }, [session.id])

  const dur = formatDuration(session.duration_minutes)

  return (
    <div className="flex items-center gap-3 bg-card px-4 py-3.5 hover:bg-muted/30 transition-colors group">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <button className="flex-1 flex flex-col items-start text-left min-w-0 gap-0.5" onClick={onTap}>
        <span className="text-sm font-medium leading-none">{formatDay(session.date)}</span>
        <span className="text-xs text-muted-foreground leading-none mt-1">
          <span style={{ color }}>{ACTIVITY_LABELS[session.activity_type as ActivityType]}</span>
          {summary ? ` · ${summary}` : ''}
          {dur ? ` · ${dur}` : ''}
        </span>
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all flex-shrink-0"
        onClick={e => { e.stopPropagation(); onDelete() }}
      >
        <Trash2 size={14} />
      </Button>
    </div>
  )
}
