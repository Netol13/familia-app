import { BottomNav } from '@/components/BottomNav'
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

  return (
    <div className="flex-1 flex flex-col pt-[env(safe-area-inset-top)]">
      <main className="flex-1 overflow-y-auto pb-2">{children}</main>
      <BottomNav />
    </div>
  )
}
