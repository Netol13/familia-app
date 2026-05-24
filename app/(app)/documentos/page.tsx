import { createClient } from '@/lib/supabase/server'
import { DocumentosList } from './_components/DocumentosList'
import type {
  Documento,
  FamilyMemberLite,
  MascotaLite,
} from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DocumentosPage() {
  const supabase = await createClient()

  const [docsRes, membersRes, mascotasRes] = await Promise.all([
    supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('family_members')
      .select('id, nombre')
      .order('nombre', { ascending: true }),
    supabase
      .from('mascotas')
      .select('id, nombre')
      .order('nombre', { ascending: true }),
  ])

  if (docsRes.error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Documentos</h1>
        <p className="text-destructive text-sm">
          Error al cargar: {docsRes.error.message}
        </p>
      </div>
    )
  }

  const documentos = (docsRes.data ?? []) as Documento[]
  const members = (membersRes.data ?? []) as FamilyMemberLite[]
  const mascotas = (mascotasRes.data ?? []) as MascotaLite[]

  return (
    <div className="p-6 space-y-5">
      <header className="space-y-1">
        <h1 className="text-3xl font-medium">Documentos</h1>
        <p className="text-sm text-muted-foreground">
          Facturas, garantías, recetas y papeles importantes del hogar
        </p>
      </header>

      <DocumentosList
        documentos={documentos}
        members={members}
        mascotas={mascotas}
      />
    </div>
  )
}
