import { BottomNav } from '@/components/layout/BottomNav'
import { SeedInitializer } from '@/components/SeedInitializer'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto">
      <SeedInitializer />
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
