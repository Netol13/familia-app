import { createClient } from '@/lib/supabase/server'
import { DocumentosList } from './_components/DocumentosList'
import { PageHeader } from '@/components/PageHeader'
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
    <div className="px-5 pt-10 pb-6 space-y-7 max-w-screen-sm mx-auto w-full">
      <PageHeader
        eyebrow="Papeles importantes"
        title="Documentos"
        description="Facturas, garantías, recetas y todo lo que conviene guardar."
      />
      <DocumentosList
        documentos={documentos}
        members={members}
        mascotas={mascotas}
      />
    </div>
  )
}
