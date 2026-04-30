'use client'
import { useEffect } from 'react'
import { seedIfEmpty } from '@/lib/seed'

export function SeedInitializer() {
  useEffect(() => {
    seedIfEmpty()
  }, [])

  return null
}
