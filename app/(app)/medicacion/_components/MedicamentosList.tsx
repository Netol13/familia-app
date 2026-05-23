'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MedicamentoCard } from './MedicamentoCard'
import { MedicamentoFormDialog } from './MedicamentoFormDialog'
import { HorariosDelDia } from './HorariosDelDia'
import type { Medicamento } from '@/lib/types'

export function MedicamentosList({ medicamentos }: { medicamentos: Medicamento[] }) {
  const [search, setSearch] = useState('')
  const [personaFiltro, setPersonaFiltro] = useState<string | null>(null)
  const [mostrarDiscontinuados, setMostrarDiscontinuados] = useState(false)

  const personas = useMemo(() => {
    const set = new Set(medicamentos.map((m) => m.persona))
    return Array.from(set).sort()
  }, [medicamentos])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    return medicamentos.filter((m) => {
      if (!mostrarDiscontinuados && !m.activo) return false
      if (personaFiltro && m.persona !== personaFiltro) return false
      if (!q) return true
      return (
        m.nombre_medicamento.toLowerCase().includes(q) ||
        m.persona.toLowerCase().includes(q) ||
        (m.dosis?.toLowerCase().includes(q) ?? false) ||
        (m.notas?.toLowerCase().includes(q) ?? false) ||
        (m.recetado_por?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [medicamentos, search, personaFiltro, mostrarDiscontinuados])

  const grupos = useMemo(() => {
    const map = new Map<string, Medicamento[]>()
    for (const m of filtrados) {
      if (!map.has(m.persona)) map.set(m.persona, [])
      map.get(m.persona)!.push(m)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtrados])

  return (
    <div className="space-y-4">
      <HorariosDelDia medicamentos={medicamentos} />

      <div className="flex gap-2">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <MedicamentoFormDialog
          personasExistentes={personas}
          trigger={<Button>+ Nuevo</Button>}
        />
      </div>

      {personas.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setPersonaFiltro(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              personaFiltro === null
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            Todos
          </button>
          {personas.map((p) => (
            <button
              key={p}
              onClick={() => setPersonaFiltro(p === personaFiltro ? null : p)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                personaFiltro === p
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              {p}
            </button>
          ))}
          <label className="text-xs flex items-center gap-1.5 ml-auto cursor-pointer text-muted-foreground">
            <input
              type="checkbox"
              checked={mostrarDiscontinuados}
              onChange={(e) => setMostrarDiscontinuados(e.target.checked)}
              className="size-3.5 accent-foreground"
            />
            Ver discontinuados
          </label>
        </div>
      )}

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {medicamentos.length === 0
            ? 'Todavía no hay medicamentos. Tocá "+ Nuevo" para agregar el primero.'
            : 'No hay medicamentos que coincidan con el filtro.'}
        </div>
      ) : (
        <div className="space-y-5">
          {grupos.map(([persona, lista]) => (
            <div key={persona} className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
                {persona}{' '}
                <span className="text-xs font-normal normal-case">
                  ({lista.filter((m) => m.activo).length} activo
                  {lista.filter((m) => m.activo).length === 1 ? '' : 's'})
                </span>
              </h2>
              <div className="grid gap-3">
                {lista.map((m) => (
                  <MedicamentoCard
                    key={m.id}
                    medicamento={m}
                    personasExistentes={personas}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
