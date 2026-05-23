'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function InstallHint() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // Mostrar solo si NO está corriendo en standalone (o sea, no está instalada todavía)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
    setShouldShow(!isStandalone)
  }, [])

  if (!shouldShow) return null

  return (
    <Link
      href="/instalar"
      className="block rounded-2xl border border-dashed border-border/60 bg-card/40 p-4 text-sm text-center hover:bg-accent/30 transition-colors"
    >
      <span className="text-muted-foreground">📱 </span>
      <span className="font-medium">Instalar en tu iPhone</span>
      <span className="text-muted-foreground"> · tocá para ver cómo</span>
    </Link>
  )
}
