'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentMemberId } from '@/lib/family'
import { revalidatePath } from 'next/cache'
import { TIPOS_EVENTO, type TipoEvento } from '@/lib/types'

function getString(form: FormData, key: string): string | null {
  const v = form.get(key)
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed.length === 0 ? null : trimmed
}

function getBoolean(form: FormData, key: string): boolean {
  const v = form.get(key)
  return v === 'on' || v === 'true'
}

function isTipoValido(value: unknown): value is TipoEvento {
  return typeof value === 'string' && (TIPOS_EVENTO as readonly string[]).includes(value)
}

function normalize(form: FormData) {
  const titulo = (form.get('titulo') as string | null)?.trim()
  if (!titulo) throw new Error('El título es obligatorio')

  const fecha = (form.get('fecha') as string | null)?.trim()
  if (!fecha) throw new Error('La fecha es obligatoria')

  const tipo = form.get('tipo')
  if (!isTipoValido(tipo)) throw new Error('Tipo de evento inválido')

  // recurrente_anual solo aplica a cumple
  const recurrente_anual = tipo === 'cumple' && getBoolean(form, 'recurrente_anual')

  // edad_actual → anio_nacimiento (solo para cumpleaños, opcional)
  let anio_nacimiento: number | null = null
  if (tipo === 'cumple') {
    const edadStr = (form.get('edad_actual') as string | null)?.trim()
    if (edadStr && edadStr !== '') {
      const edad = parseInt(edadStr, 10)
      if (!isNaN(edad) && edad >= 0 && edad <= 130) {
        anio_nacimiento = new Date().getFullYear() - edad
      }
    }
  }

  return {
    titulo,
    descripcion: getString(form, 'descripcion'),
    fecha,
    tipo,
    persona_id: getString(form, 'persona_id'),
    mascota_id: getString(form, 'mascota_id'),
    recurrente_anual,
    anio_nacimiento,
  }
}

export async function createEvento(formData: FormData) {
  const supabase = await createClient()
  const data = normalize(formData)
  const memberId = await getCurrentMemberId(supabase)

  const { error } = await supabase.from('eventos').insert({
    ...data,
    created_by: memberId,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/calendario')
  revalidatePath('/')
}

export async function updateEvento(id: string, formData: FormData) {
  const supabase = await createClient()
  const data = normalize(formData)

  const { error } = await supabase
    .from('eventos')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/calendario')
  revalidatePath('/')
}

export async function deleteEvento(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('eventos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/calendario')
  revalidatePath('/')
}

export async function toggleCompletado(id: string, completado: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('eventos')
    .update({ completado })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/calendario')
  revalidatePath('/')
}
