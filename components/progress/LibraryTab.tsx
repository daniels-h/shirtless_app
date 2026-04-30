'use client'
import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { ActivityType, Exercise, MuscleGroup } from '@/lib/types'
import { ACTIVITY_LABELS, ACTIVITY_COLORS } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { MUSCLE_GROUP_LABELS } from '@/components/log/constants'
import { cn } from '@/lib/utils'

const ACTIVITY_FILTERS: { value: ActivityType | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'weights', label: 'Weights' },
  { value: 'kettlebell', label: 'Kettlebell' },
  { value: 'swim', label: 'Swim' },
  { value: 'yoga', label: 'Yoga' },
]

const MUSCLE_GROUPS: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full-body', 'other']
const ACTIVITY_TYPES: ActivityType[] = ['weights', 'kettlebell', 'swim', 'yoga', 'custom']

export function LibraryTab() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [editTarget, setEditTarget] = useState<Exercise | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', activity_type: 'weights' as ActivityType, muscle_group: '' as MuscleGroup | '' })

  const exercises = useLiveQuery(
    () => db.exercises.orderBy('name').toArray(),
    []
  )

  const filtered = (exercises ?? []).filter(e => {
    if (filter !== 'all' && e.activity_type !== filter) return false
    if (query && !e.name.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const openCreate = () => {
    setForm({ name: '', activity_type: 'weights', muscle_group: '' })
    setCreating(true)
  }

  const openEdit = (ex: Exercise) => {
    setForm({ name: ex.name, activity_type: ex.activity_type, muscle_group: ex.muscle_group ?? '' })
    setEditTarget(ex)
  }

  const save = async () => {
    if (!form.name.trim()) return
    if (editTarget) {
      await db.exercises.update(editTarget.id, {
        name: form.name.trim(),
        activity_type: form.activity_type,
        muscle_group: form.muscle_group || undefined,
      })
      setEditTarget(null)
    } else {
      await db.exercises.add({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        activity_type: form.activity_type,
        muscle_group: form.muscle_group || undefined,
        created_at: new Date().toISOString(),
      })
      setCreating(false)
    }
  }

  const deleteExercise = async (ex: Exercise) => {
    await db.exercises.delete(ex.id)
    toast(`Deleted "${ex.name}"`, {
      action: { label: 'Undo', onClick: () => db.exercises.add(ex) },
      duration: 4000,
    })
  }

  const sheetOpen = creating || !!editTarget
  const closeSheet = () => { setCreating(false); setEditTarget(null) }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search library..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* Activity filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {ACTIVITY_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              filter === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/50'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ScrollArea className="h-[calc(100vh-320px)]">
        <div className="space-y-1 pr-1">
          {filtered.map(ex => {
            const color = ACTIVITY_COLORS[ex.activity_type]
            return (
              <div
                key={ex.id}
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.muscle_group ? MUSCLE_GROUP_LABELS[ex.muscle_group] : ACTIVITY_LABELS[ex.activity_type]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ex)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteExercise(ex)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-12">No exercises found</p>
          )}
        </div>
      </ScrollArea>

      <Button className="w-full gap-2 rounded-xl" onClick={openCreate}>
        <Plus size={16} />
        Add Exercise
      </Button>

      {/* Create / Edit sheet */}
      <Sheet open={sheetOpen} onOpenChange={v => !v && closeSheet()}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-10">
          <SheetHeader className="mb-6">
            <SheetTitle>{editTarget ? 'Edit Exercise' : 'New Exercise'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                autoFocus
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && save()}
                placeholder="Exercise name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Activity type</Label>
              <Select value={form.activity_type} onValueChange={v => setForm(f => ({ ...f, activity_type: v as ActivityType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{ACTIVITY_LABELS[t]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Muscle group (optional)</Label>
              <Select value={form.muscle_group || 'none'} onValueChange={v => setForm(f => ({ ...f, muscle_group: v === 'none' ? '' : v as MuscleGroup }))}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {MUSCLE_GROUPS.map(g => <SelectItem key={g} value={g}>{MUSCLE_GROUP_LABELS[g]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={save}>
              {editTarget ? 'Save Changes' : 'Add Exercise'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
