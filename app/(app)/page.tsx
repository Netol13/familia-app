import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { InstallHint } from '@/components/InstallHint'
import {
  etiquetaRelativa,
  filtrarPorRango,
  unificarEventos,
  urgenciaDe,
} from '@/lib/calendario'
import type {
  Compra,
  DocumentoCalendarioLite,
  Evento,
  FamilyMemberLite,
  MascotaEventoLite,
  MascotaLite,
  TipoUnificado,
} from '@/lib/types'
import { CATEGORIA_EMOJI } from '@/lib/compras'

export const dynamic = 'force-dynamic'

const sections = [
  {
    href: '/calendario',
    title: 'Agenda',
    description: 'Cumpleaños, vencimientos, turnos y todo lo que se viene',
    emoji: '📅',
    countFrom: 'eventos' as const,
    countLabel: (n: number) => `${n} próxim${n === 1 ? 'o' : 'os'}`,
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
    href: '/documentos',
    title: 'Documentos',
    description: 'Facturas, garantías, recetas y papeles importantes',
    emoji: '📄',
    countFrom: 'documentos' as const,
    countLabel: (n: number) => `${n} documento${n === 1 ? '' : 's'}`,
  },
  {
    href: '/servicios',
    title: 'Servicios',
    description: 'Plomero, electricista, piletero y todos los contactos del hogar',
    emoji: '🔧',
    countFrom: 'servicios' as const,
    countLabel: (n: number) => `${n} contacto${n === 1 ? '' : 's'}`,
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

const ICONO_TIPO: Record<TipoUnificado, string> = {
  cumple: '🎂',
  vencimiento: '⚠️',
  turno: '🩺',
  otro: '📅',
  'doc-vence': '📕',
  'mascota-proxima': '🐾',
}

function saludoPorHora(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function tonoUrgencia(tono: 'vencido' | 'pronto' | 'futuro') {
  if (tono === 'vencido') return 'bg-destructive/15 text-destructive'
  if (tono === 'pronto') return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
  return 'bg-muted text-muted-foreground'
}

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('family_members')
    .select('nombre')
    .eq('user_id', user?.id ?? '')
    .single()

  const emailPrefix = user?.email?.split('@')[0] ?? null
  const pareceEmailPrefix = !!emailPrefix && member?.nombre === emailPrefix

  const [
    servCount,
    medCount,
    mascCount,
    docCount,
    eventosRes,
    docsCalRes,
    mascotaEventosCalRes,
    membersCalRes,
    mascotasCalRes,
    comprasRes,
  ] = await Promise.all([
    supabase.from('servicios').select('*', { count: 'exact', head: true }),
    supabase
      .from('medicamentos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true),
    supabase.from('mascotas').select('*', { count: 'exact', head: true }),
    supabase.from('documentos').select('*', { count: 'exact', head: true }),
    supabase.from('eventos').select('*'),
    supabase
      .from('documentos')
      .select('id, nombre, tipo, vencimiento, persona_id, mascota_id')
      .not('vencimiento', 'is', null),
    supabase
      .from('mascota_eventos')
      .select('id, mascota_id, tipo, fecha, detalle, proxima_fecha')
      .not('proxima_fecha', 'is', null),
    supabase.from('family_members').select('id, nombre'),
    supabase.from('mascotas').select('id, nombre'),
    supabase
      .from('lista_compras')
      .select('*')
      .eq('completado', false)
      .order('created_at', { ascending: false }),
  ])

  const eventos = (eventosRes.data ?? []) as Evento[]
  const documentosCal = (docsCalRes.data ?? []) as DocumentoCalendarioLite[]
  const mascotaEventosCal = (mascotaEventosCalRes.data ?? []) as MascotaEventoLite[]
  const membersCal = (membersCalRes.data ?? []) as FamilyMemberLite[]
  const mascotasCal = (mascotasCalRes.data ?? []) as MascotaLite[]
  const comprasPendientes = (comprasRes.data ?? []) as Compra[]
  const comprasTop3 = comprasPendientes.slice(0, 3)

  const unificados = unificarEventos({
    eventos,
    documentos: documentosCal,
    mascotaEventos: mascotaEventosCal,
    members: membersCal,
    mascotas: mascotasCal,
  }).filter((it) => !it.completado)

  // Próximas fechas: ventana 30 días, max 5 items para el panel
  const proximas30 = filtrarPorRango(unificados, 'mes')
  const proximasParaPanel = proximas30.slice(0, 5)

  const counts: Record<string, number> = {
    servicios: servCount.count ?? 0,
    medicamentos: medCount.count ?? 0,
    mascotas: mascCount.count ?? 0,
    documentos: docCount.count ?? 0,
    eventos: proximas30.length,
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

      {pareceEmailPrefix && (
        <Link
          href="/configuracion"
          className="block rounded-2xl border border-dashed border-border/80 bg-accent/30 px-4 py-3 hover:bg-accent/50 transition-colors"
        >
          <p className="text-sm">
            👋 ¿Querés que te llamemos por tu nombre?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Te decimos <span className="font-medium">«{nombre}»</span> porque te tomamos del email. Click para cambiarlo.
          </p>
        </Link>
      )}

      {comprasPendientes.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">
                🛒 Lista de compras
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {comprasPendientes.length} pendiente{comprasPendientes.length === 1 ? '' : 's'}
                </span>
              </h2>
              <Link
                href="/compras"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todo →
              </Link>
            </div>
            <ul className="space-y-1.5">
              {comprasTop3.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <span className="text-base shrink-0">{CATEGORIA_EMOJI[c.categoria]}</span>
                  <span className="truncate flex-1">
                    {c.item}
                    {c.cantidad && (
                      <span className="text-muted-foreground ml-2">· {c.cantidad}</span>
                    )}
                  </span>
                </li>
              ))}
              {comprasPendientes.length > 3 && (
                <li className="text-xs text-muted-foreground pl-7 pt-1">
                  +{comprasPendientes.length - 3} más
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {proximasParaPanel.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Próximas fechas</h2>
              <Link
                href="/calendario"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Ver todo →
              </Link>
            </div>
            <ul className="space-y-2">
              {proximasParaPanel.map((it) => {
                const urgencia = urgenciaDe(it.fecha)
                return (
                  <li key={it.id} className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{ICONO_TIPO[it.tipo]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate leading-tight">{it.titulo}</p>
                      {it.subtitulo && (
                        <p className="text-xs text-muted-foreground truncate">
                          {it.subtitulo}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md shrink-0 ${tonoUrgencia(urgencia)}`}
                    >
                      {etiquetaRelativa(it.fecha)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

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
