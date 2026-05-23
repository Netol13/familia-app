'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/', label: 'Inicio', icon: '🏠' },
  { href: '/servicios', label: 'Servicios', icon: '🔧' },
  { href: '/medicacion', label: 'Medicación', icon: '💊' },
  { href: '/mascotas', label: 'Mascotas', icon: '🐾' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky bottom-0 z-50 border-t bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <ul className="flex justify-around items-center h-16">
        {items.map((item) => {
          const active = pathname === item.href ||
                         (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 h-full text-xs ${
                  active ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                <span className="text-xl leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
