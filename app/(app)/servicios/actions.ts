'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ServicioInput } from '@/lib/types'

function normalize(input: FormData): ServicioInput {
  const get = (k: string) => {
    const v = input.get(k)
    if (typeof v !== 'string') return null
    const trimmed = v.trim()
    return trimmed.length === 0 ? null : trimmed
  }
  return {
    nombre: (input.get('nombre') as string).trim(),
    rubro: (input.get('rubro') as string).trim().toLowerCase(),
    telefono: get('telefono'),
    whatsapp: get('whatsapp'),
    direccion: get('direccion'),
    notas: get('notas'),
    ultimo_contacto: get('ultimo_contacto'),
  }
}

export async function createServicio(formData: FormData) {
  const supabase = await createClient()
  const data = normalize(formData)

  const { data: member } = await supabase
    .from('family_members')
    .select('id')
    .single()

  const { error } = await supabase.from('servicios').insert({
    ...data,
    created_by: member?.id ?? null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/servicios')
}

export async function updateServicio(id: string, formData: FormData) {
  const supabase = await createClient()
  const data = normalize(formData)

  const { error } = await supabase
    .from('servicios')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/servicios')
}

export async function deleteServicio(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('servicios').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/servicios')
}

export async function marcarContactado(id: string) {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from('servicios')
    .update({ ultimo_contacto: today })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/servicios')
}
