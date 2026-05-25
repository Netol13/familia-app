import Link from 'next/link'
import { Settings } from 'lucide-react'

export function SettingsButton() {
  return (
    <Link
      href="/configuracion"
      aria-label="Configuración"
      className="size-10 rounded-full bg-surface/80 backdrop-blur-xl border border-border/70 flex items-center justify-center text-foreground hover:bg-accent active:scale-95 transition-all"
      style={{ boxShadow: 'var(--shadow-soft)' }}
    >
      <Settings className="size-5" strokeWidth={2.2} />
    </Link>
  )
}
