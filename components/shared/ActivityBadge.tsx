import { ACTIVITY_COLORS, ACTIVITY_LABELS, type ActivityType } from '@/lib/types'

interface Props {
  type: ActivityType
}

export function ActivityBadge({ type }: Props) {
  const color = ACTIVITY_COLORS[type]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {ACTIVITY_LABELS[type]}
    </span>
  )
}
