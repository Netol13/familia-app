import { createClient } from '@/lib/supabase/server'
import { MedicamentosList } from './_components/MedicamentosList'
import { PageHeader } from '@/components/PageHeader'
import type { Medicamento } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function MedicacionPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('medicamentos')
    .select('*')
    .order('persona', { ascending: true })
    .order('activo', { ascending: false })
    .order('nombre_medicamento', { ascending: true })

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Medicación</h1>
        <p className="text-destructive text-sm">Error al cargar: {error.message}</p>
      </div>
    )
  }

  const medicamentos = (data ?? []) as Medicamento[]

  return (
    <div className="px-5 pt-10 pb-6 space-y-7 max-w-screen-sm mx-auto w-full">
      <PageHeader
        eyebrow="Tratamientos"
        title="Medicación"
        description="Qué toma cada uno, cuándo y cuánto."
      />
      <MedicamentosList medicamentos={medicamentos} />
    </div>
  )
}
