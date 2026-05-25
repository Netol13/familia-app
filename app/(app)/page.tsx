import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

const secondarySections = [
  { href: '/calendario',  title: 'Agenda',     emoji: '📅', countFrom: 'eventos'      as const, suffix: 'próximos' },
  { href: '/medicacion',  title: 'Medicación', emoji: '💊', countFrom: 'medicamentos' as const, suffix: 'activos'  },
  { href: '/documentos',  title: 'Documentos', emoji: '📄', countFrom: 'documentos'   as const, suffix: 'guardados'},
  { href: '/servicios',   title: 'Servicios',  emoji: '🔧', countFrom: 'servicios'    as const, suffix: 'contactos'},
  { href: '/mascotas',    title: 'Mascotas',   emoji: '🐾', countFrom: 'mascotas'     as const, suffix: ''         },
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
  if (tono === 'pronto')  return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
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
    supabase.from('medicamentos').select('*', { count: 'exact', head: true }).eq('activo', true),
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

  const proximas30 = filtrarPorRango(unificados, 'mes')
  const proximasParaPanel = proximas30.slice(0, 4)

  const counts: Record<string, number> = {
    servicios: servCount.count ?? 0,
    medicamentos: medCount.count ?? 0,
    mascotas: mascCount.count ?? 0,
    documentos: docCount.count ?? 0,
    eventos: proximas30.length,
  }

  const nombre = member?.nombre ?? 'familia'

  return (
    <div className="px-5 pt-10 pb-10 space-y-10 max-w-screen-sm mx-auto w-full">
      {/* HERO */}
      <header className="space-y-3">
        <p className="eyebrow">{saludoPorHora()}</p>
        <h1 className="text-hero text-[clamp(3.25rem,12vw,5.5rem)]">
          {nombre}.
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Lo del hogar, en un solo lugar.
        </p>
      </header>

      {pareceEmailPrefix && (
        <Link
          href="/configuracion"
          className="block rounded-2xl border border-dashed border-border bg-surface px-4 py-3 hover:bg-accent/40 transition-colors"
        >
          <p className="text-sm">
            👋 ¿Querés que te llamemos por tu nombre?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Te decimos <span className="font-medium">«{nombre}»</span> porque te tomamos del email. Click para cambiarlo.
          </p>
        </Link>
      )}

      {/* HERO CARD — Compras (si hay) */}
      {comprasPendientes.length > 0 && (
        <Link
          href="/compras"
          className="group block relative overflow-hidden rounded-3xl bg-card border border-border/60 p-6 hover:-translate-y-0.5 transition-transform"
          style={{ boxShadow: 'var(--shadow-hero)' }}
        >
          {/* Halo terracota arriba a la derecha */}
          <div
            aria-hidden
            className="absolute -top-16 -right-16 size-56 rounded-full opacity-60 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(closest-side, var(--brand) 0%, transparent 70%)', opacity: 0.18 }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="size-2 rounded-full bg-brand" />
              <p className="eyebrow text-brand/90">Lista de compras</p>
            </div>
            <p className="text-3xl font-heading tracking-tight leading-none mb-1">
              {comprasPendientes.length}
              <span className="text-sm font-sans font-normal text-muted-foreground ml-2">
                pendiente{comprasPendientes.length === 1 ? '' : 's'}
              </span>
            </p>

            <ul className="mt-4 divide-y divide-border/60">
              {comprasTop3.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2">
                  <span className="text-base shrink-0 w-5 text-center">
                    {CATEGORIA_EMOJI[c.categoria]}
                  </span>
                  <span className="truncate flex-1 text-sm">
                    {c.item}
                    {c.cantidad && (
                      <span className="text-muted-foreground ml-2">· {c.cantidad}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between text-brand">
              <span className="text-sm font-medium">
                {comprasPendientes.length > 3
                  ? `+${comprasPendientes.length - 3} más`
                  : 'Ver la lista'}
              </span>
              <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
            </div>
          </div>
        </Link>
      )}

      {/* PRÓXIMAS FECHAS — editorial */}
      {proximasParaPanel.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Lo que se viene</p>
              <h2 className="text-2xl font-heading tracking-tight mt-1">
                Próximas fechas
              </h2>
            </div>
            <Link
              href="/calendario"
              className="text-sm text-brand hover:underline underline-offset-4"
            >
              Ver todo →
            </Link>
          </div>
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {proximasParaPanel.map((it) => {
              const urgencia = urgenciaDe(it.fecha)
              return (
                <li key={it.id} className="flex items-center gap-4 py-3.5">
                  <span className="text-2xl shrink-0 w-8 text-center">
                    {ICONO_TIPO[it.tipo]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] truncate leading-tight">{it.titulo}</p>
                    {it.subtitulo && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {it.subtitulo}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${tonoUrgencia(urgencia)}`}>
                    {etiquetaRelativa(it.fecha)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* GRID 2x2 — módulos secundarios */}
      <section className="space-y-4">
        <p className="eyebrow">Atajos</p>
        <div className="grid grid-cols-2 gap-3">
          {secondarySections.map((s) => {
            const n = counts[s.countFrom]
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group relative overflow-hidden rounded-2xl bg-card border border-border/60 p-4 hover:bg-accent/30 hover:border-border transition-colors"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <div className="flex flex-col h-full min-h-[110px] justify-between">
                  <span className="text-3xl leading-none">{s.emoji}</span>
                  <div>
                    <p className="text-base font-heading tracking-tight leading-tight">
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n === 0 ? 'Vacío' : `${n}${s.suffix ? ' ' + s.suffix : ''}`}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <InstallHint />
    </div>
  )
}
