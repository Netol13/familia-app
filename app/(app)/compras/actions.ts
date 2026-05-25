'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentMemberId } from '@/lib/family'
import { revalidatePath } from 'next/cache'
import { CATEGORIAS_COMPRAS, type CategoriaCompra } from '@/lib/types'

function isCategoriaValida(value: unknown): value is CategoriaCompra {
  return (
    typeof value === 'string' &&
    (CATEGORIAS_COMPRAS as readonly string[]).includes(value)
  )
}

function getString(form: FormData, key: string): string | null {
  const v = form.get(key)
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed.length === 0 ? null : trimmed
}

export async function createCompra(formData: FormData) {
  const supabase = await createClient()

  const item = (formData.get('item') as string | null)?.trim()
  if (!item) throw new Error('Escribí qué hay que comprar')

  const categoriaRaw = formData.get('categoria')
  const categoria: CategoriaCompra = isCategoriaValida(categoriaRaw) ? categoriaRaw : 'otro'

  const memberId = await getCurrentMemberId(supabase)

  const { error } = await supabase.from('lista_compras').insert({
    item,
    categoria,
    cantidad: getString(formData, 'cantidad'),
    notas: getString(formData, 'notas'),
    created_by: memberId,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/compras')
  revalidatePath('/')
}

export async function updateCompra(id: string, formData: FormData) {
  const supabase = await createClient()

  const item = (formData.get('item') as string | null)?.trim()
  if (!item) throw new Error('Escribí qué hay que comprar')

  const categoriaRaw = formData.get('categoria')
  const categoria: CategoriaCompra = isCategoriaValida(categoriaRaw) ? categoriaRaw : 'otro'

  const { error } = await supabase
    .from('lista_compras')
    .update({
      item,
      categoria,
      cantidad: getString(formData, 'cantidad'),
      notas: getString(formData, 'notas'),
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/compras')
  revalidatePath('/')
}

export async function toggleCompra(id: string, completado: boolean) {
  const supabase = await createClient()
  const memberId = await getCurrentMemberId(supabase)

  const patch = completado
    ? {
        completado: true,
        completado_por: memberId,
        completado_at: new Date().toISOString(),
      }
    : {
        completado: false,
        completado_por: null,
        completado_at: null,
      }

  const { error } = await supabase.from('lista_compras').update(patch).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/compras')
  revalidatePath('/')
}

export async function deleteCompra(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('lista_compras').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/compras')
  revalidatePath('/')
}

export async function vaciarCompletados() {
  const supabase = await createClient()
  const { error } = await supabase.from('lista_compras').delete().eq('completado', true)
  if (error) throw new Error(error.message)
  revalidatePath('/compras')
  revalidatePath('/')
}
