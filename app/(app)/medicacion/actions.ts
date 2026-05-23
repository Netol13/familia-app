'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type MedicamentoInput = {
  persona: string
  nombre_medicamento: string
  dosis: string | null
  frecuencia: string | null
  horario: string[] | null
  recetado_por: string | null
  notas: string | null
  activo: boolean
}

function normalize(input: FormData): MedicamentoInput {
  const get = (k: string) => {
    const v = input.get(k)
    if (typeof v !== 'string') return null
    const trimmed = v.trim()
    return trimmed.length === 0 ? null : trimmed
  }
  const horarioRaw = input.get('horario')
  const horario =
    typeof horarioRaw === 'string' && horarioRaw.trim().length > 0
      ? horarioRaw.split(',').map((s) => s.trim()).filter(Boolean)
      : null

  return {
    persona: (input.get('persona') as string).trim(),
    nombre_medicamento: (input.get('nombre_medicamento') as string).trim(),
    dosis: get('dosis'),
    frecuencia: get('frecuencia'),
    horario,
    recetado_por: get('recetado_por'),
    notas: get('notas'),
    activo: input.get('activo') === 'on' || input.get('activo') === 'true',
  }
}

export async function createMedicamento(formData: FormData) {
  const supabase = await createClient()
  const data = normalize(formData)

  const { data: member } = await supabase
    .from('family_members')
    .select('id')
    .single()

  const { error } = await supabase.from('medicamentos').insert({
    ...data,
    created_by: member?.id ?? null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/medicacion')
}

export async function updateMedicamento(id: string, formData: FormData) {
  const supabase = await createClient()
  const data = normalize(formData)
  const { error } = await supabase
    .from('medicamentos')
    .update(data)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/medicacion')
}

export async function deleteMedicamento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('medicamentos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/medicacion')
}

export async function toggleActivo(id: string, activoActual: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('medicamentos')
    .update({ activo: !activoActual })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/medicacion')
}
