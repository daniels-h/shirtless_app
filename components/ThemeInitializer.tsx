'use client'
import { useEffect } from 'react'

export function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const isDark = stored ? stored === 'dark' : true
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  return null
}
