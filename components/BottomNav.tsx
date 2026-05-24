'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/servicios', label: 'Servicios', icon: '🔧' },
  { href: '/medicacion', label: 'Medicación', icon: '💊' },
  { href: '/mascotas', label: 'Mascotas', icon: '🐾' },
  { href: '/documentos', label: 'Docs', icon: '📄' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-50 border-t border-border/60 bg-background/85 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const active = pathname === item.href ||
                         (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 h-12 mx-0.5 rounded-2xl transition-all ${
                  active
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground active:bg-muted/50'
                }`}
              >
                <span className={`text-lg leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] tracking-wide">
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
