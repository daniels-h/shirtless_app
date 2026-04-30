'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/log', label: 'Log', icon: Plus },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="flex max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href === '/log' && pathname.startsWith('/log'))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon
                size={22}
                className={cn(
                  'transition-all',
                  href === '/log' && 'rounded-full bg-primary p-1.5 text-primary-foreground',
                  href === '/log' && active && 'scale-110',
                )}
                strokeWidth={href === '/log' ? 2.5 : active ? 2 : 1.5}
              />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
