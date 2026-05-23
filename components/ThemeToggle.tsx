'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  function toggle() {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="size-10 rounded-full bg-background/70 backdrop-blur-md border border-border/60 shadow-sm flex items-center justify-center text-foreground hover:bg-accent active:scale-95 transition-all"
    >
      {!mounted ? (
        <span className="size-4" />
      ) : isDark ? (
        <Sun className="size-5" strokeWidth={2.2} />
      ) : (
        <Moon className="size-5" strokeWidth={2.2} />
      )}
    </button>
  )
}
