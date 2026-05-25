import { createClient } from '@/lib/supabase/server'
import type { Compra, FamilyMemberLite } from '@/lib/types'
import { PageHeader } from '@/components/PageHeader'
import { ComprasList } from './_components/ComprasList'

export const dynamic = 'force-dynamic'

export default async function ComprasPage() {
  const supabase = await createClient()

  const [comprasRes, membersRes] = await Promise.all([
    supabase
      .from('lista_compras')
      .select('*')
      .order('completado', { ascending: true })
      .order('categoria', { ascending: true })
      .order('created_at', { ascending: true }),
    supabase.from('family_members').select('id, nombre'),
  ])

  const compras = (comprasRes.data ?? []) as Compra[]
  const members = (membersRes.data ?? []) as FamilyMemberLite[]

  return (
    <div className="px-5 pt-10 pb-6 space-y-7 max-w-screen-sm mx-auto w-full">
      <PageHeader
        eyebrow="Compartida en vivo"
        title="Compras"
        description="Lo que va sumando la familia, en tiempo real."
      />
      <ComprasList compras={compras} members={members} />
    </div>
  )
}
