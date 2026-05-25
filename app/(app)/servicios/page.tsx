import { createClient } from '@/lib/supabase/server'
import { ServiciosList } from './_components/ServiciosList'
import { PageHeader } from '@/components/PageHeader'
import type { Servicio } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ServiciosPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .order('rubro', { ascending: true })
    .order('nombre', { ascending: true })

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Servicios</h1>
        <p className="text-destructive text-sm">Error al cargar: {error.message}</p>
      </div>
    )
  }

  const servicios = (data ?? []) as Servicio[]

  return (
    <div className="px-5 pt-10 pb-6 space-y-7 max-w-screen-sm mx-auto w-full">
      <PageHeader
        eyebrow="Contactos"
        title="Servicios"
        description="Plomero, electricista, piletero y demás del hogar."
      />
      <ServiciosList servicios={servicios} />
    </div>
  )
}
