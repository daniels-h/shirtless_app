'use client'
import { useState, useEffect } from 'react'
import type { WeightUnit } from '../types'

export function useUnit() {
  const [unit, setUnit] = useState<WeightUnit>('kg')

  useEffect(() => {
    const stored = localStorage.getItem('weight_unit') as WeightUnit | null
    if (stored === 'kg' || stored === 'lbs') setUnit(stored)
  }, [])

  const toggle = () => {
    const next: WeightUnit = unit === 'kg' ? 'lbs' : 'kg'
    setUnit(next)
    localStorage.setItem('weight_unit', next)
  }

  return { unit, toggle }
}
