'use client'
import { useUnit } from '@/lib/hooks/useUnit'
import { Button } from '@/components/ui/button'

export function UnitToggle() {
  const { unit, toggle } = useUnit()
  return (
    <Button variant="ghost" size="sm" onClick={toggle} className="h-7 px-2 text-xs font-mono text-muted-foreground">
      {unit.toUpperCase()}
    </Button>
  )
}
