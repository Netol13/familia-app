import { createClient } from '@/lib/supabase/server'
import { MedicamentosList } from './_components/MedicamentosList'
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
    <div className="p-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl font-medium">Medicación</h1>
        <p className="text-sm text-muted-foreground">
          Qué toma cada uno, cuándo y cuánto
        </p>
      </header>

      <MedicamentosList medicamentos={medicamentos} />
    </div>
  )
}
