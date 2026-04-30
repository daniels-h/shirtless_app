'use client'
import { Sun, Moon } from 'lucide-react'
import { WeeklyStrip } from '@/components/home/WeeklyStrip'
import { StatsWidgets } from '@/components/home/StatsWidgets'
import { RecentDays } from '@/components/home/RecentDays'
import { UnitToggle } from '@/components/shared/UnitToggle'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/hooks/useTheme'

export default function HomePage() {
  const { dark, toggle: toggleTheme } = useTheme()

  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Shirtless</h1>
        <div className="flex items-center gap-1">
          <UnitToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>

      {/* Weekly Overview */}
      <WeeklyStrip />

      {/* Stat Widgets */}
      <StatsWidgets />

      {/* Recent Days */}
      <RecentDays />
    </div>
  )
}
