import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const sections = [
  {
    href: '/servicios',
    title: 'Servicios',
    description: 'Plomero, electricista, piletero y todos los contactos del hogar',
    emoji: '🔧',
  },
  {
    href: '/medicacion',
    title: 'Medicación',
    description: 'Qué toma cada uno, dosis y horarios',
    emoji: '💊',
  },
  {
    href: '/mascotas',
    title: 'Mascotas',
    description: 'Datos, vacunas, controles y veterinario',
    emoji: '🐾',
  },
]

export default function Home() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Familia</h1>
        <p className="text-muted-foreground">Lo del hogar, en un solo lugar</p>
      </header>

      <div className="grid gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none">{s.emoji}</span>
                  <div>
                    <CardTitle>{s.title}</CardTitle>
                    <CardDescription>{s.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
