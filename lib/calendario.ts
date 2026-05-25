import type {
  DocumentoCalendarioLite,
  Evento,
  EventoUnificado,
  FamilyMemberLite,
  MascotaEventoLite,
  MascotaLite,
} from './types'

/** Devuelve hoy en formato 'YYYY-MM-DD' usando hora local */
export function hoyISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isoConOffset(diasDesdeHoy: number): string {
  const d = new Date()
  d.setDate(d.getDate() + diasDesdeHoy)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Diferencia en días entre dos fechas ISO ('YYYY-MM-DD') */
export function diasEntre(desdeISO: string, hastaISO: string): number {
  const [y1, m1, d1] = desdeISO.split('-').map(Number)
  const [y2, m2, d2] = hastaISO.split('-').map(Number)
  const a = new Date(y1, m1 - 1, d1).getTime()
  const b = new Date(y2, m2 - 1, d2).getTime()
  return Math.round((b - a) / 86400000)
}

/**
 * Para un cumple recurrente: si la fecha original ya pasó este año, devolver
 * la próxima ocurrencia anual. Si todavía no llegó, mantener la del año actual.
 */
function proximaOcurrenciaAnual(fechaOriginalISO: string, hoy: string): string {
  const [, mes, dia] = fechaOriginalISO.split('-')
  const [yHoy, mHoy, dHoy] = hoy.split('-').map(Number)
  const candidatoEsteAnio = `${yHoy}-${mes}-${dia}`
  const candidatoFecha = new Date(yHoy, Number(mes) - 1, Number(dia))
  const hoyFecha = new Date(yHoy, mHoy - 1, dHoy)
  if (candidatoFecha.getTime() >= hoyFecha.getTime()) {
    return candidatoEsteAnio
  }
  return `${yHoy + 1}-${mes}-${dia}`
}

const LABEL_DOC_TIPO: Record<string, string> = {
  factura: 'Factura',
  garantia: 'Garantía',
  receta: 'Receta',
  contrato: 'Contrato',
  manual: 'Manual',
  seguro: 'Seguro',
  otro: 'Documento',
}

export function unificarEventos({
  eventos,
  documentos,
  mascotaEventos,
  members,
  mascotas,
  hoy = hoyISO(),
}: {
  eventos: Evento[]
  documentos: DocumentoCalendarioLite[]
  mascotaEventos: MascotaEventoLite[]
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
  hoy?: string
}): EventoUnificado[] {
  const nombreMember = (id: string | null) =>
    id ? (members.find((m) => m.id === id)?.nombre ?? null) : null
  const nombreMascota = (id: string | null) =>
    id ? (mascotas.find((m) => m.id === id)?.nombre ?? null) : null

  const unificados: EventoUnificado[] = []

  for (const e of eventos) {
    const fechaEfectiva =
      e.recurrente_anual && !e.completado
        ? proximaOcurrenciaAnual(e.fecha, hoy)
        : e.fecha
    const ctx: string[] = []
    const persona = nombreMember(e.persona_id)
    const mascota = nombreMascota(e.mascota_id)
    if (persona) ctx.push(persona)
    if (mascota) ctx.push(`🐾 ${mascota}`)
    // Para cumpleaños con año de nacimiento guardado, calcular edad en la próxima ocurrencia
    if (e.tipo === 'cumple' && e.anio_nacimiento != null) {
      const anioCumple = Number(fechaEfectiva.split('-')[0])
      const edad = anioCumple - e.anio_nacimiento
      ctx.push(`Cumple ${edad} años`)
    }
    unificados.push({
      id: `evt:${e.id}`,
      origen: 'custom',
      origen_id: e.id,
      fecha: fechaEfectiva,
      titulo: e.titulo,
      subtitulo: ctx.length > 0 ? ctx.join(' · ') : (e.descripcion ?? null),
      tipo: e.tipo,
      completado: e.completado,
      href: '/calendario',
      recurrente_anual: e.recurrente_anual,
    })
  }

  for (const d of documentos) {
    const persona = nombreMember(d.persona_id)
    const mascota = nombreMascota(d.mascota_id)
    const ctx: string[] = []
    if (persona) ctx.push(persona)
    if (mascota) ctx.push(`🐾 ${mascota}`)
    const tipoLabel = LABEL_DOC_TIPO[d.tipo] ?? 'Documento'
    unificados.push({
      id: `doc:${d.id}`,
      origen: 'documento',
      origen_id: d.id,
      fecha: d.vencimiento,
      titulo: `Vence: ${d.nombre}`,
      subtitulo: ctx.length > 0 ? `${tipoLabel} · ${ctx.join(' · ')}` : tipoLabel,
      tipo: 'doc-vence',
      completado: false,
      href: '/documentos',
      recurrente_anual: false,
    })
  }

  for (const me of mascotaEventos) {
    const mascota = nombreMascota(me.mascota_id)
    unificados.push({
      id: `mev:${me.id}`,
      origen: 'mascota',
      origen_id: me.id,
      fecha: me.proxima_fecha,
      titulo: `${mascota ?? 'Mascota'}: próxima ${me.tipo}`,
      subtitulo: me.detalle,
      tipo: 'mascota-proxima',
      completado: false,
      href: '/mascotas',
      recurrente_anual: false,
    })
  }

  unificados.sort((a, b) => a.fecha.localeCompare(b.fecha))
  return unificados
}

export type RangoCalendario = 'hoy' | 'semana' | 'mes' | 'todos'

export function filtrarPorRango(
  items: EventoUnificado[],
  rango: RangoCalendario,
  hoy: string = hoyISO()
): EventoUnificado[] {
  if (rango === 'todos') return items
  const limiteDias = rango === 'hoy' ? 0 : rango === 'semana' ? 7 : 30
  return items.filter((it) => {
    const d = diasEntre(hoy, it.fecha)
    return d >= 0 && d <= limiteDias
  })
}

/** Agrupa por fecha conservando el orden cronológico */
export function agruparPorFecha(
  items: EventoUnificado[]
): Array<{ fecha: string; items: EventoUnificado[] }> {
  const map = new Map<string, EventoUnificado[]>()
  for (const it of items) {
    const arr = map.get(it.fecha) ?? []
    arr.push(it)
    map.set(it.fecha, arr)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([fecha, items]) => ({ fecha, items }))
}

/** Texto amigable: 'Hoy', 'Mañana', 'Jueves 28/5', 'Hace 3 días' */
export function etiquetaFecha(fechaISO: string, hoy: string = hoyISO()): string {
  const dias = diasEntre(hoy, fechaISO)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  if (dias === -1) return 'Ayer'
  if (dias > 1 && dias <= 7) {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const [y, m, d] = fechaISO.split('-').map(Number)
    const fd = new Date(y, m - 1, d)
    return `${nombres[fd.getDay()]} ${d}/${m}`
  }
  if (dias < 0) return `Hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'}`
  const [y, m, d] = fechaISO.split('-').map(Number)
  const hoyY = Number(hoy.split('-')[0])
  return y === hoyY ? `${d}/${m}` : `${d}/${m}/${y}`
}

/** Etiqueta relativa corta para badges: 'Hoy', 'En 3 días', 'Hace 2 días' */
export function etiquetaRelativa(fechaISO: string, hoy: string = hoyISO()): string {
  const dias = diasEntre(hoy, fechaISO)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  if (dias === -1) return 'Ayer'
  if (dias > 1) return `En ${dias} días`
  return `Hace ${Math.abs(dias)} días`
}

/** Tono visual de urgencia para el badge */
export function urgenciaDe(fechaISO: string, hoy: string = hoyISO()): 'vencido' | 'pronto' | 'futuro' {
  const d = diasEntre(hoy, fechaISO)
  if (d < 0) return 'vencido'
  if (d <= 14) return 'pronto'
  return 'futuro'
}
