import type { WeightUnit } from './types'

export const KG_TO_LBS = 2.20462

export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  if (unit === 'lbs') return Math.round(kg * KG_TO_LBS * 4) / 4
  return kg
}

export function toKg(value: number, unit: WeightUnit): number {
  if (unit === 'lbs') return value / KG_TO_LBS
  return value
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  const val = toDisplayWeight(kg, unit)
  return `${val} ${unit}`
}

export function weightStep(unit: WeightUnit): number {
  return unit === 'kg' ? 2.5 : 5
}

export function nearestStep(value: number, unit: WeightUnit): number {
  const step = weightStep(unit)
  return Math.round(value / step) * step
}
