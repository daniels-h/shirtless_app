'use client'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { ACTIVITY_COLORS, ACTIVITY_LABELS, type ActivityType } from '@/lib/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

const ACTIVITY_TYPES: ActivityType[] = ['weights', 'swim', 'kettlebell', 'yoga', 'custom']

interface Props {
  open: boolean
  onClose: () => void
}

export function StartSessionSheet({ open, onClose }: Props) {
  const router = useRouter()

  const handlePick = async (type: ActivityType) => {
    const now = new Date()
    const id = crypto.randomUUID()
    await db.sessions.add({
      id,
      date: now.toISOString().split('T')[0],
      activity_type: type,
      start_time: now.toISOString(),
      status: 'active',
      synced: false,
    })
    localStorage.setItem('active_session_id', id)
    onClose()
    router.push(`/log?id=${id}`)
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle>Start a Session</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_TYPES.map(type => {
            const color = ACTIVITY_COLORS[type]
            return (
              <button
                key={type}
                onClick={() => handlePick(type)}
                className="flex items-center justify-center rounded-xl p-5 h-16 transition-all active:scale-95"
                style={{ backgroundColor: `${color}18`, border: `1.5px solid ${color}33` }}
              >
                <span className="text-sm font-semibold" style={{ color }}>
                  {ACTIVITY_LABELS[type]}
                </span>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
