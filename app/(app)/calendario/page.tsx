import { createClient } from '@/lib/supabase/server'
import { CalendarioList } from './_components/CalendarioList'
import { unificarEventos } from '@/lib/calendario'
import type {
  DocumentoCalendarioLite,
  Evento,
  FamilyMemberLite,
  MascotaEventoLite,
  MascotaLite,
} from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function CalendarioPage() {
  const supabase = await createClient()

  const [eventosRes, docsRes, mascotaEventosRes, membersRes, mascotasRes] =
    await Promise.all([
      supabase
        .from('eventos')
        .select('*')
        .order('fecha', { ascending: true }),
      supabase
        .from('documentos')
        .select('id, nombre, tipo, vencimiento, persona_id, mascota_id')
        .not('vencimiento', 'is', null),
      supabase
        .from('mascota_eventos')
        .select('id, mascota_id, tipo, fecha, detalle, proxima_fecha')
        .not('proxima_fecha', 'is', null),
      supabase
        .from('family_members')
        .select('id, nombre')
        .order('nombre', { ascending: true }),
      supabase
        .from('mascotas')
        .select('id, nombre')
        .order('nombre', { ascending: true }),
    ])

  const error =
    eventosRes.error ?? docsRes.error ?? mascotaEventosRes.error
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Calendario</h1>
        <p className="text-destructive text-sm">Error al cargar: {error.message}</p>
      </div>
    )
  }

  const eventos = (eventosRes.data ?? []) as Evento[]
  const documentos = (docsRes.data ?? []) as DocumentoCalendarioLite[]
  const mascotaEventos = (mascotaEventosRes.data ?? []) as MascotaEventoLite[]
  const members = (membersRes.data ?? []) as FamilyMemberLite[]
  const mascotas = (mascotasRes.data ?? []) as MascotaLite[]

  const unificados = unificarEventos({
    eventos,
    documentos,
    mascotaEventos,
    members,
    mascotas,
  })

  return (
    <div className="p-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl font-medium">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Cumpleaños, vencimientos, turnos y todo lo que se viene
        </p>
      </header>

      <CalendarioList
        unificados={unificados}
        eventosCustom={eventos}
        members={members}
        mascotas={mascotas}
      />
    </div>
  )
}
