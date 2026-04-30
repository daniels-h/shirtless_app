'use client'
import { useState, useEffect } from 'react'

export function useActiveSession() {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setActiveId(localStorage.getItem('active_session_id'))
  }, [])

  const start = (id: string) => {
    localStorage.setItem('active_session_id', id)
    setActiveId(id)
  }

  const clear = () => {
    localStorage.removeItem('active_session_id')
    setActiveId(null)
  }

  return { activeId, start, clear }
}
