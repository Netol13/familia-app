'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ServicioCard } from './ServicioCard'
import { ServicioFormDialog } from './ServicioFormDialog'
import type { Servicio } from '@/lib/types'

export function ServiciosList({ servicios }: { servicios: Servicio[] }) {
  const [search, setSearch] = useState('')
  const [rubroFiltro, setRubroFiltro] = useState<string | null>(null)

  const rubros = useMemo(() => {
    const set = new Set(servicios.map((s) => s.rubro))
    return Array.from(set).sort()
  }, [servicios])

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase()
    return servicios.filter((s) => {
      if (rubroFiltro && s.rubro !== rubroFiltro) return false
      if (!q) return true
      return (
        s.nombre.toLowerCase().includes(q) ||
        s.rubro.toLowerCase().includes(q) ||
        (s.notas?.toLowerCase().includes(q) ?? false) ||
        (s.direccion?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [servicios, search, rubroFiltro])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <ServicioFormDialog
          rubrosExistentes={rubros}
          trigger={<Button>+ Nuevo</Button>}
        />
      </div>

      {rubros.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRubroFiltro(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              rubroFiltro === null
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            Todos
          </button>
          {rubros.map((r) => (
            <button
              key={r}
              onClick={() => setRubroFiltro(r === rubroFiltro ? null : r)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                rubroFiltro === r
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          {servicios.length === 0
            ? 'Todavía no hay servicios. Tocá "+ Nuevo" para agregar el primero.'
            : 'No hay servicios que coincidan con el filtro.'}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((s) => (
            <ServicioCard key={s.id} servicio={s} rubrosExistentes={rubros} />
          ))}
        </div>
      )}
    </div>
  )
}
