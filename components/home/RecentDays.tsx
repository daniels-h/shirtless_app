'use client'
import { useLiveQuery } from 'dexie-react-hooks'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { ACTIVITY_COLORS, ACTIVITY_LABELS } from '@/lib/types'
import { formatWeight } from '@/lib/units'
import { useUnit } from '@/lib/hooks/useUnit'
import { ChevronRight } from 'lucide-react'

function relativeDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatDuration(mins?: number): string {
  if (!mins) return ''
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export function RecentDays() {
  const { unit } = useUnit()
  const router = useRouter()

  const sessions = useLiveQuery(
    () => db.sessions
      .orderBy('date')
      .reverse()
      .filter(s => s.status === 'completed')
      .limit(6)
      .toArray(),
    []
  )

  if (!sessions?.length) return null

  return (
    <div className="space-y-1">
      <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Recent</h2>
      {sessions.map(session => (
        <SessionRow
          key={session.id}
          session={session}
          unit={unit}
          onTap={() => router.push(`/log?id=${session.id}`)}
        />
      ))}
    </div>
  )
}

function SessionRow({ session, unit, onTap }: { session: any; unit: any; onTap: () => void }) {
  const color = ACTIVITY_COLORS[session.activity_type as keyof typeof ACTIVITY_COLORS]

  const detail = useLiveQuery(async () => {
    if (session.activity_type === 'weights') {
      const entries = await db.weightEntries.where('session_id').equals(session.id).toArray()
      const exerciseIds = [...new Set(entries.map(e => e.exercise_id))]
      return `${exerciseIds.length} exercise${exerciseIds.length !== 1 ? 's' : ''}`
    }
    if (session.activity_type === 'swim') {
      const e = await db.swimEntries.where('session_id').equals(session.id).first()
      if (!e) return ''
      return e.distance_meters ? `${(e.distance_meters / 1000).toFixed(1)} km` : `${e.stroke_type}`
    }
    if (session.activity_type === 'yoga') {
      const e = await db.yogaEntries.where('session_id').equals(session.id).first()
      return e ? `${e.style.charAt(0).toUpperCase() + e.style.slice(1)} · ${e.intensity}/5` : ''
    }
    if (session.activity_type === 'kettlebell') {
      const e = await db.kettlebellEntries.where('session_id').equals(session.id).first()
      return e?.mode === 'circuit' ? 'Circuit' : 'Set-based'
    }
    return ''
  }, [session.id])

  return (
    <button
      onClick={onTap}
      className="w-full flex items-center justify-between py-3 px-1 rounded-xl hover:bg-muted/40 active:bg-muted/60 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        <div className="flex flex-col items-start min-w-0">
          <span className="text-sm font-medium leading-snug">
            {relativeDate(session.date)}
          </span>
          <span className="text-xs text-muted-foreground leading-snug">
            <span style={{ color }}>{ACTIVITY_LABELS[session.activity_type as keyof typeof ACTIVITY_LABELS]}</span>
            {detail ? ` · ${detail}` : ''}
            {session.duration_minutes ? ` · ${formatDuration(session.duration_minutes)}` : ''}
          </span>
        </div>
      </div>
      <ChevronRight size={14} className="text-muted-foreground/50 flex-shrink-0" />
    </button>
  )
}
