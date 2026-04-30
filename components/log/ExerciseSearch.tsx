'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { ActivityType, Exercise } from '@/lib/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MUSCLE_GROUP_LABELS } from './constants'

interface Props {
  open: boolean
  activityType: ActivityType
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}

export function ExerciseSearch({ open, activityType, onSelect, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const exercises = useLiveQuery(
    () => db.exercises.where('activity_type').equals(activityType).sortBy('name'),
    [activityType]
  )

  const filtered = (exercises ?? []).filter(e =>
    e.name.toLowerCase().includes(query.toLowerCase())
  )

  const recent = useLiveQuery(async () => {
    const entries = await db.weightEntries.orderBy('id').reverse().limit(50).toArray()
    const seen = new Set<string>()
    const ids: string[] = []
    for (const e of entries) {
      if (!seen.has(e.exercise_id)) { seen.add(e.exercise_id); ids.push(e.exercise_id) }
      if (ids.length >= 5) break
    }
    const exs = await db.exercises.bulkGet(ids)
    return exs.filter(Boolean) as Exercise[]
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const ex: Exercise = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      activity_type: activityType,
      created_at: new Date().toISOString(),
    }
    await db.exercises.add(ex)
    onSelect(ex)
    setNewName('')
    setCreating(false)
    onClose()
  }

  const handleSelect = (ex: Exercise) => {
    onSelect(ex)
    setQuery('')
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-2xl h-[85vh] flex flex-col pb-8">
        <SheetHeader className="mb-4 flex-shrink-0">
          <SheetTitle>Add Exercise</SheetTitle>
        </SheetHeader>

        {creating ? (
          <div className="flex flex-col gap-4 px-1">
            <Input
              autoFocus
              placeholder="Exercise name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleCreate}>Add</Button>
              <Button variant="outline" className="flex-1" onClick={() => setCreating(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex-shrink-0 mb-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search exercises..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            {!query && recent && recent.length > 0 && (
              <div className="mb-4 flex-shrink-0">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Recent</p>
                <div className="flex flex-wrap gap-2">
                  {recent.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => handleSelect(ex)}
                      className="px-3 py-1.5 rounded-full border border-border text-sm hover:bg-muted transition-colors"
                    >
                      {ex.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {filtered.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleSelect(ex)}
                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-sm font-medium">{ex.name}</span>
                    {ex.muscle_group && (
                      <span className="text-xs text-muted-foreground">
                        {MUSCLE_GROUP_LABELS[ex.muscle_group] ?? ex.muscle_group}
                      </span>
                    )}
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">No exercises found</p>
                )}
              </div>
            </ScrollArea>

            <Button
              variant="outline"
              className="mt-4 flex-shrink-0 gap-2"
              onClick={() => { setCreating(true); setNewName(query) }}
            >
              <Plus size={16} />
              {query ? `Add "${query}"` : 'Add new exercise'}
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
