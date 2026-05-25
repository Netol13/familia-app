import { BottomNav } from '@/components/BottomNav'
import { FloatingMic } from '@/components/FloatingMic'
import { VoiceProvider } from '@/components/VoiceContext'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: mascotasData }, { data: personasData }] = await Promise.all([
    supabase.from('mascotas').select('id, nombre').order('nombre'),
    supabase.from('family_members').select('id, nombre').order('nombre'),
  ])

  return (
    <VoiceProvider mascotas={mascotasData ?? []} personas={personasData ?? []}>
      <div className="flex-1 flex flex-col pt-[env(safe-area-inset-top)]">
        <main className="flex-1 overflow-y-auto pb-2">{children}</main>
        <BottomNav />
        <FloatingMic />
      </div>
    </VoiceProvider>
  )
}
