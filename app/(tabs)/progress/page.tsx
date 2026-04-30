'use client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StrengthTab } from '@/components/progress/StrengthTab'
import { HistoryTab } from '@/components/progress/HistoryTab'
import { CalendarTab } from '@/components/progress/CalendarTab'
import { LibraryTab } from '@/components/progress/LibraryTab'

export default function ProgressPage() {
  return (
    <div className="flex flex-col min-h-full px-4 pt-6 pb-4">
      <h1 className="text-xl font-semibold tracking-tight mb-5">Progress</h1>
      <Tabs defaultValue="strength" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 rounded-xl mb-5 h-10">
          <TabsTrigger value="strength" className="rounded-lg text-xs">Strength</TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg text-xs">History</TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg text-xs">Calendar</TabsTrigger>
          <TabsTrigger value="library" className="rounded-lg text-xs">Library</TabsTrigger>
        </TabsList>
        <TabsContent value="strength" className="flex-1 mt-0"><StrengthTab /></TabsContent>
        <TabsContent value="history" className="flex-1 mt-0"><HistoryTab /></TabsContent>
        <TabsContent value="calendar" className="flex-1 mt-0"><CalendarTab /></TabsContent>
        <TabsContent value="library" className="flex-1 mt-0"><LibraryTab /></TabsContent>
      </Tabs>
    </div>
  )
}
