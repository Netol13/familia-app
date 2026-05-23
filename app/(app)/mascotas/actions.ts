'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type MascotaInput = {
  nombre: string
  especie: string | null
  raza: string | null
  fecha_nacimiento: string | null
  veterinario_nombre: string | null
  veterinario_telefono: string | null
  alimento: string | null
  notas: string | null
}

function normalizeMascota(input: FormData): MascotaInput {
  const get = (k: string) => {
    const v = input.get(k)
    if (typeof v !== 'string') return null
    const trimmed = v.trim()
    return trimmed.length === 0 ? null : trimmed
  }
  return {
    nombre: (input.get('nombre') as string).trim(),
    especie: get('especie'),
    raza: get('raza'),
    fecha_nacimiento: get('fecha_nacimiento'),
    veterinario_nombre: get('veterinario_nombre'),
    veterinario_telefono: get('veterinario_telefono'),
    alimento: get('alimento'),
    notas: get('notas'),
  }
}

export async function createMascota(formData: FormData) {
  const supabase = await createClient()
  const data = normalizeMascota(formData)
  const { error } = await supabase.from('mascotas').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/mascotas')
}

export async function updateMascota(id: string, formData: FormData) {
  const supabase = await createClient()
  const data = normalizeMascota(formData)
  const { error } = await supabase.from('mascotas').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/mascotas')
}

export async function deleteMascota(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('mascotas').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/mascotas')
}

type EventoInput = {
  mascota_id: string
  tipo: string
  fecha: string
  detalle: string | null
  proxima_fecha: string | null
}

function normalizeEvento(input: FormData): EventoInput {
  const get = (k: string) => {
    const v = input.get(k)
    if (typeof v !== 'string') return null
    const trimmed = v.trim()
    return trimmed.length === 0 ? null : trimmed
  }
  return {
    mascota_id: input.get('mascota_id') as string,
    tipo: (input.get('tipo') as string).trim(),
    fecha: (input.get('fecha') as string),
    detalle: get('detalle'),
    proxima_fecha: get('proxima_fecha'),
  }
}

export async function createEvento(formData: FormData) {
  const supabase = await createClient()
  const data = normalizeEvento(formData)
  const { error } = await supabase.from('mascota_eventos').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/mascotas')
}

export async function deleteEvento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('mascota_eventos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/mascotas')
}
