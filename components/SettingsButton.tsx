import Link from 'next/link'
import { Settings } from 'lucide-react'

export function SettingsButton() {
  return (
    <Link
      href="/configuracion"
      aria-label="Configuración"
      className="size-10 rounded-full bg-background/70 backdrop-blur-md border border-border/60 shadow-sm flex items-center justify-center text-foreground hover:bg-accent active:scale-95 transition-all"
    >
      <Settings className="size-5" strokeWidth={2.2} />
    </Link>
  )
}
