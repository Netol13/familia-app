import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { InstallHint } from '@/components/InstallHint'

export const dynamic = 'force-dynamic'

const sections = [
  {
    href: '/servicios',
    title: 'Servicios',
    description: 'Plomero, electricista, piletero y todos los contactos del hogar',
    emoji: '🔧',
    countFrom: 'servicios' as const,
    countLabel: (n: number) => `${n} contacto${n === 1 ? '' : 's'}`,
  },
  {
    href: '/medicacion',
    title: 'Medicación',
    description: 'Qué toma cada uno, dosis y horarios',
    emoji: '💊',
    countFrom: 'medicamentos' as const,
    countLabel: (n: number) =>
      `${n} medicamento${n === 1 ? '' : 's'} activo${n === 1 ? '' : 's'}`,
  },
  {
    href: '/mascotas',
    title: 'Mascotas',
    description: 'Datos, vacunas, controles y veterinario',
    emoji: '🐾',
    countFrom: 'mascotas' as const,
    countLabel: (n: number) => `${n} mascota${n === 1 ? '' : 's'}`,
  },
]

function saludoPorHora(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('family_members')
    .select('nombre')
    .eq('user_id', user?.id ?? '')
    .single()

  const [servCount, medCount, mascCount] = await Promise.all([
    supabase.from('servicios').select('*', { count: 'exact', head: true }),
    supabase
      .from('medicamentos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true),
    supabase.from('mascotas').select('*', { count: 'exact', head: true }),
  ])

  const counts: Record<string, number> = {
    servicios: servCount.count ?? 0,
    medicamentos: medCount.count ?? 0,
    mascotas: mascCount.count ?? 0,
  }

  const nombre = member?.nombre ?? 'familia'

  return (
    <div className="p-6 space-y-8">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">{saludoPorHora()},</p>
        <h1 className="text-4xl font-medium leading-tight">
          {nombre}
        </h1>
        <p className="text-sm text-muted-foreground italic">
          Lo del hogar, en un solo lugar
        </p>
      </header>

      <div className="grid gap-3">
        {sections.map((s) => {
          const n = counts[s.countFrom]
          return (
            <Link key={s.href} href={s.href}>
              <Card className="hover:bg-accent/40 transition-colors border-border/60 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl leading-none shrink-0">
                      {s.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-medium leading-tight">
                        {s.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {n === 0 ? s.description : s.countLabel(n)}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-lg">›</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <InstallHint />
    </div>
  )
}
