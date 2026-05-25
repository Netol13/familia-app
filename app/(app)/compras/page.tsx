import { createClient } from '@/lib/supabase/server'
import type { Compra, FamilyMemberLite } from '@/lib/types'
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
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-medium leading-tight">Lista de compras</h1>
        <p className="text-sm text-muted-foreground italic">
          Compartida con toda la familia, en tiempo real
        </p>
      </header>

      <ComprasList compras={compras} members={members} />
    </div>
  )
}
