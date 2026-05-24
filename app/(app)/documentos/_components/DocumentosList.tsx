'use client'

import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { DocumentoCard } from './DocumentoCard'
import { DocumentoFormDialog } from './DocumentoFormDialog'
import {
  TIPOS_DOCUMENTO,
  type Documento,
  type FamilyMemberLite,
  type MascotaLite,
  type TipoDocumento,
} from '@/lib/types'

const LABEL_TIPO: Record<TipoDocumento, string> = {
  factura: 'Factura',
  garantia: 'Garantía',
  receta: 'Receta',
  contrato: 'Contrato',
  manual: 'Manual',
  seguro: 'Seguro',
  otro: 'Otro',
}

export function DocumentosList({
  documentos,
  members,
  mascotas,
}: {
  documentos: Documento[]
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
}) {
  const [search, setSearch] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<TipoDocumento | null>(null)

  const tiposPresentes = useMemo(() => {
    const set = new Set<TipoDocumento>()
    documentos.forEach((d) => set.add(d.tipo))
    return TIPOS_DOCUMENTO.filter((t) => set.has(t))
  }, [documentos])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    return documentos.filter((d) => {
      if (tipoFiltro && d.tipo !== tipoFiltro) return false
      if (!q) return true
      return (
        d.nombre.toLowerCase().includes(q) ||
        (d.descripcion?.toLowerCase().includes(q) ?? false) ||
        d.tipo.toLowerCase().includes(q)
      )
    })
  }, [documentos, search, tipoFiltro])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <DocumentoFormDialog
          members={members}
          mascotas={mascotas}
          trigger={<Button>+ Subir</Button>}
        />
      </div>

      {tiposPresentes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTipoFiltro(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              tipoFiltro === null
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            Todos
          </button>
          {tiposPresentes.map((t) => (
            <button
              key={t}
              onClick={() => setTipoFiltro(t === tipoFiltro ? null : t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                tipoFiltro === t
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              {LABEL_TIPO[t]}
            </button>
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        documentos.length === 0 ? (
          <EmptyState
            emoji="📄"
            title="Todavía sin documentos"
            description="Facturas, garantías, recetas, contratos... subí los papeles importantes del hogar para tenerlos siempre a mano."
            action={
              <DocumentoFormDialog
                members={members}
                mascotas={mascotas}
                trigger={<Button>+ Subir el primero</Button>}
              />
            }
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay documentos que coincidan con el filtro.
          </div>
        )
      ) : (
        <div className="grid gap-3">
          {filtrados.map((d) => (
            <DocumentoCard
              key={d.id}
              documento={d}
              members={members}
              mascotas={mascotas}
            />
          ))}
        </div>
      )}
    </div>
  )
}
