'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentMemberId } from '@/lib/family'
import { revalidatePath } from 'next/cache'
import { TIPOS_DOCUMENTO, type TipoDocumento } from '@/lib/types'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

const BUCKET = 'documentos'

function getString(form: FormData, key: string): string | null {
  const v = form.get(key)
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed.length === 0 ? null : trimmed
}

function isTipoValido(value: unknown): value is TipoDocumento {
  return typeof value === 'string' && (TIPOS_DOCUMENTO as readonly string[]).includes(value)
}

function slug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export async function uploadDocumento(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('archivo')
  if (!(file instanceof File) || file.size === 0) {
    throw new Error('Tenés que seleccionar un archivo')
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('El archivo supera el máximo de 10 MB')
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type || 'desconocido'}`)
  }

  const tipo = formData.get('tipo')
  if (!isTipoValido(tipo)) {
    throw new Error('Tipo de documento inválido')
  }

  const nombre = (formData.get('nombre') as string | null)?.trim()
  if (!nombre) {
    throw new Error('El nombre es obligatorio')
  }

  const descripcion = getString(formData, 'descripcion')
  const persona_id = getString(formData, 'persona_id')
  const mascota_id = getString(formData, 'mascota_id')
  const fecha_documento = getString(formData, 'fecha_documento')
  const vencimiento = getString(formData, 'vencimiento')

  const memberId = await getCurrentMemberId(supabase)

  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : ''
  const safeBase = slug(file.name.replace(/\.[^.]+$/, '')) || 'documento'
  const stamp = Date.now()
  const memberPrefix = memberId ?? 'shared'
  const storage_path = `${memberPrefix}/${stamp}-${safeBase}${ext ? `.${ext}` : ''}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storage_path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) throw new Error(`Error al subir: ${uploadError.message}`)

  const { error: insertError } = await supabase.from('documentos').insert({
    nombre,
    descripcion,
    tipo,
    persona_id,
    mascota_id,
    storage_path,
    mime_type: file.type,
    size_bytes: file.size,
    fecha_documento,
    vencimiento,
    created_by: memberId,
  })

  if (insertError) {
    // Si falla el insert, intentamos limpiar el archivo subido para no dejar huérfanos
    await supabase.storage.from(BUCKET).remove([storage_path])
    throw new Error(insertError.message)
  }

  revalidatePath('/documentos')
  revalidatePath('/')
}

export async function updateDocumentoMetadata(id: string, formData: FormData) {
  const supabase = await createClient()

  const tipo = formData.get('tipo')
  if (!isTipoValido(tipo)) {
    throw new Error('Tipo de documento inválido')
  }

  const nombre = (formData.get('nombre') as string | null)?.trim()
  if (!nombre) {
    throw new Error('El nombre es obligatorio')
  }

  const { error } = await supabase
    .from('documentos')
    .update({
      nombre,
      descripcion: getString(formData, 'descripcion'),
      tipo,
      persona_id: getString(formData, 'persona_id'),
      mascota_id: getString(formData, 'mascota_id'),
      fecha_documento: getString(formData, 'fecha_documento'),
      vencimiento: getString(formData, 'vencimiento'),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/documentos')
}

export async function deleteDocumento(id: string) {
  const supabase = await createClient()

  const { data: doc, error: fetchError } = await supabase
    .from('documentos')
    .select('storage_path')
    .eq('id', id)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // Primero borramos el archivo; si falla el storage, no perdemos la fila.
  if (doc?.storage_path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([doc.storage_path])
    if (storageError) throw new Error(`Error al borrar archivo: ${storageError.message}`)
  }

  const { error: deleteError } = await supabase.from('documentos').delete().eq('id', id)
  if (deleteError) throw new Error(deleteError.message)

  revalidatePath('/documentos')
  revalidatePath('/')
}

export async function getDocumentoSignedUrl(
  storage_path: string,
  opts: { download?: boolean } = {}
): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storage_path, 60 * 60, {
      download: opts.download ?? false,
    })
  if (error) throw new Error(error.message)
  return data.signedUrl
}
