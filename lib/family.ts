import type { SupabaseClient } from '@supabase/supabase-js'

export async function getCurrentMemberId(
  supabase: SupabaseClient
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('family_members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  return data?.id ?? null
}
