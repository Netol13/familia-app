'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const mainTabs = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/compras', label: 'Compras', icon: '🛒' },
  { href: '/calendario', label: 'Agenda', icon: '📅' },
  { href: '/medicacion', label: 'Meds', icon: '💊' },
  { href: '/documentos', label: 'Docs', icon: '📄' },
]

const masItems = [
  { href: '/servicios', label: 'Servicios', icon: '🔧', description: 'Plomero, electricista y contactos del hogar' },
  { href: '/mascotas', label: 'Mascotas', icon: '🐾', description: 'Datos, vacunas y veterinario' },
  { href: '/configuracion', label: 'Configuración', icon: '⚙️', description: 'Tu perfil y sesión' },
  { href: '/instalar', label: 'Instalar app', icon: '📲', description: 'Cómo agregar la app al inicio del iPhone' },
]

export function BottomNav() {
  const pathname = usePathname()
  const [masOpen, setMasOpen] = useState(false)

  const isMasActive = masItems.some((item) =>
    pathname === item.href || pathname.startsWith(item.href + '/')
  )

  return (
    <nav className="sticky bottom-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-center h-16 px-1">
        {mainTabs.map((item) => {
          const active = pathname === item.href ||
                         (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <li key={item.href} className="flex-1 min-w-0">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 h-12 mx-0.5 px-1 rounded-2xl transition-all ${
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground active:bg-muted/50'
                }`}
              >
                <span className={`text-lg leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-wide truncate max-w-full">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}

        <li className="flex-1 min-w-0">
          <Dialog open={masOpen} onOpenChange={setMasOpen}>
            <DialogTrigger
              render={
                <button
                  type="button"
                  className={`w-full flex flex-col items-center justify-center gap-0.5 h-12 mx-0.5 px-1 rounded-2xl transition-all ${
                    isMasActive
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground active:bg-muted/50'
                  }`}
                  aria-label="Más opciones"
                />
              }
            >
              <span className={`text-lg leading-none transition-transform ${isMasActive ? 'scale-110' : ''}`}>
                •••
              </span>
              <span className="text-[10px] tracking-wide truncate max-w-full">Más</span>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Más opciones</DialogTitle>
              </DialogHeader>
              <ul className="space-y-1">
                {masItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMasOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-accent transition-colors"
                    >
                      <span className="text-2xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </DialogContent>
          </Dialog>
        </li>
      </ul>
    </nav>
  )
}
