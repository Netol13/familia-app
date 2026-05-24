'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateMiNombre(formData: FormData) {
  const nombre = (formData.get('nombre') as string | null)?.trim()
  if (!nombre) throw new Error('El nombre no puede estar vacío')
  if (nombre.length > 60) throw new Error('Máximo 60 caracteres')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesión expirada')

  const { error } = await supabase
    .from('family_members')
    .update({ nombre })
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)

  // El saludo del home y las cards de quién creó qué leen de family_members.
  revalidatePath('/')
  revalidatePath('/configuracion')
  revalidatePath('/calendario')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
