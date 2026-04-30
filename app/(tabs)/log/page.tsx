'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Session } from '@/lib/types'
import { ACTIVITY_COLORS, ACTIVITY_LABELS } from '@/lib/types'
import { WeightsLogger } from '@/components/log/WeightsLogger'
import { SwimLogger } from '@/components/log/SwimLogger'
import { YogaLogger } from '@/components/log/YogaLogger'
import { KettlebellLogger } from '@/components/log/KettlebellLogger'
import { StartSessionSheet } from '@/components/home/StartSessionSheet'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Square } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function SessionTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [startTime])

  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  const fmt = (n: number) => String(n).padStart(2, '0')

  return (
    <span className="font-mono text-sm text-muted-foreground tabular-nums">
      {h > 0 && `${fmt(h)}:`}{fmt(m)}:{fmt(s)}
    </span>
  )
}

function LogPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const paramId = searchParams.get('id')

  const [resolvedId, setResolvedId] = useState<string | null>(null)

  useEffect(() => {
    if (paramId) {
      setResolvedId(paramId)
    } else {
      const stored = localStorage.getItem('active_session_id')
      setResolvedId(stored)
    }
  }, [paramId])

  const session = useLiveQuery<Session | undefined>(
    () => resolvedId ? db.sessions.get(resolvedId) : Promise.resolve(undefined),
    [resolvedId]
  )

  const endSession = async () => {
    if (!session) return
    const now = new Date()
    const duration = Math.round((now.getTime() - new Date(session.start_time).getTime()) / 60000)
    await db.sessions.update(session.id, {
      status: 'completed',
      end_time: now.toISOString(),
      duration_minutes: duration,
    })
    localStorage.removeItem('active_session_id')
    toast('Session saved')
    router.push('/home')
  }

  if (!resolvedId) {
    return <StartScreen />
  }

  if (!session) {
    return <div className="flex items-center justify-center min-h-full text-muted-foreground text-sm">Loading...</div>
  }

  const color = ACTIVITY_COLORS[session.activity_type]
  const isActive = session.status === 'active'

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push('/home')}>
              <ArrowLeft size={18} />
            </Button>
            <div
              className="rounded-full px-3 py-1 text-sm font-medium"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {ACTIVITY_LABELS[session.activity_type]}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isActive && <SessionTimer startTime={session.start_time} />}
            {isActive ? (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 rounded-full h-8 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={endSession}
              >
                <Square size={12} />
                End
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground rounded-full border border-border px-2 py-1">
                {session.date}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Logger body */}
      <div className="flex-1 px-4 py-5 space-y-4">
        {session.activity_type === 'weights' && <WeightsLogger session={session} />}
        {session.activity_type === 'swim' && <SwimLogger session={session} />}
        {session.activity_type === 'yoga' && <YogaLogger session={session} />}
        {session.activity_type === 'kettlebell' && <KettlebellLogger session={session} />}
        {session.activity_type === 'custom' && (
          <div className="rounded-2xl border border-border p-6 text-center text-muted-foreground text-sm">
            Custom session — add notes or use the space freely.
          </div>
        )}
      </div>
    </div>
  )
}

function StartScreen() {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex flex-col items-center justify-center min-h-full gap-6 px-6">
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold">Ready to train?</h2>
        <p className="text-sm text-muted-foreground">Pick an activity to start logging.</p>
      </div>
      <Button size="lg" className="w-full h-14 text-base font-semibold rounded-2xl" onClick={() => setOpen(true)}>
        Start Session
      </Button>
      <StartSessionSheet open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

export default function LogPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-full text-muted-foreground text-sm">Loading...</div>}>
      <LogPageInner />
    </Suspense>
  )
}
