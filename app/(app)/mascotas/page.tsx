import { createClient } from '@/lib/supabase/server'
import { MascotasList } from './_components/MascotasList'
import { PageHeader } from '@/components/PageHeader'
import type { Mascota, MascotaEvento } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function MascotasPage() {
  const supabase = await createClient()

  const [{ data: mascotasData, error: mascotasError }, { data: eventosData, error: eventosError }] =
    await Promise.all([
      supabase.from('mascotas').select('*').order('nombre', { ascending: true }),
      supabase
        .from('mascota_eventos')
        .select('*')
        .order('fecha', { ascending: false }),
    ])

  if (mascotasError || eventosError) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Mascotas</h1>
        <p className="text-destructive text-sm">
          Error al cargar: {mascotasError?.message ?? eventosError?.message}
        </p>
      </div>
    )
  }

  const mascotas = (mascotasData ?? []) as Mascota[]
  const eventos = (eventosData ?? []) as MascotaEvento[]

  const eventosPorMascota: Record<string, MascotaEvento[]> = {}
  for (const e of eventos) {
    if (!eventosPorMascota[e.mascota_id]) eventosPorMascota[e.mascota_id] = []
    eventosPorMascota[e.mascota_id].push(e)
  }

  return (
    <div className="px-5 pt-10 pb-6 space-y-7 max-w-screen-sm mx-auto w-full">
      <PageHeader
        eyebrow="La fauna del hogar"
        title="Mascotas"
        description="Datos, veterinario, vacunas y controles."
      />
      <MascotasList mascotas={mascotas} eventosPorMascota={eventosPorMascota} />
    </div>
  )
}
