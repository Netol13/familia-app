'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import { EventoCard } from './EventoCard'
import { EventoFormDialog } from './EventoFormDialog'
import {
  agruparPorFecha,
  etiquetaFecha,
  filtrarPorRango,
  type RangoCalendario,
} from '@/lib/calendario'
import type {
  Evento,
  EventoUnificado,
  FamilyMemberLite,
  MascotaLite,
} from '@/lib/types'

const RANGOS: { value: RangoCalendario; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'todos', label: 'Todos' },
]

export function CalendarioList({
  unificados,
  eventosCustom,
  members,
  mascotas,
}: {
  unificados: EventoUnificado[]
  eventosCustom: Evento[]
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
}) {
  const [rango, setRango] = useState<RangoCalendario>('semana')

  const filtrados = useMemo(() => {
    const base = unificados.filter((it) => !it.completado)
    return filtrarPorRango(base, rango)
  }, [unificados, rango])

  const completados = useMemo(
    () => unificados.filter((it) => it.completado),
    [unificados]
  )

  const grupos = useMemo(() => agruparPorFecha(filtrados), [filtrados])

  const counts = useMemo(() => {
    const base = unificados.filter((it) => !it.completado)
    return {
      hoy: filtrarPorRango(base, 'hoy').length,
      semana: filtrarPorRango(base, 'semana').length,
      mes: filtrarPorRango(base, 'mes').length,
      todos: base.length,
    }
  }, [unificados])

  const eventoCustomById = useMemo(() => {
    const map = new Map<string, Evento>()
    eventosCustom.forEach((e) => map.set(e.id, e))
    return map
  }, [eventosCustom])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex flex-wrap gap-2 flex-1">
          {RANGOS.map((r) => (
            <button
              key={r.value}
              onClick={() => setRango(r.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                rango === r.value
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-muted-foreground hover:bg-accent'
              }`}
            >
              {r.label}{' '}
              <span className="opacity-70">({counts[r.value]})</span>
            </button>
          ))}
        </div>
        <EventoFormDialog
          members={members}
          mascotas={mascotas}
          trigger={<Button>+ Nuevo</Button>}
        />
      </div>

      {grupos.length === 0 ? (
        unificados.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="Todavía sin fechas"
            description="Cumpleaños, vencimientos, turnos médicos... cargá una fecha y la app te avisa cuando se acerca. Los vencimientos de Documentos y las próximas vacunas de Mascotas aparecen acá automáticamente."
            action={
              <EventoFormDialog
                members={members}
                mascotas={mascotas}
                trigger={<Button>+ Cargar la primera</Button>}
              />
            }
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nada en este rango. Probá ampliar el filtro.
          </div>
        )
      ) : (
        <div className="space-y-5">
          {grupos.map(({ fecha, items }) => (
            <section key={fecha} className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/85 backdrop-blur-sm py-1 -mx-2 px-2 rounded">
                {etiquetaFecha(fecha)}
              </h2>
              <div className="grid gap-3">
                {items.map((it) => (
                  <EventoCard
                    key={it.id}
                    item={it}
                    eventoOriginal={
                      it.origen === 'custom'
                        ? eventoCustomById.get(it.origen_id)
                        : undefined
                    }
                    members={members}
                    mascotas={mascotas}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {completados.length > 0 && (
        <details className="pt-4">
          <summary className="text-sm text-muted-foreground cursor-pointer">
            Ver completados ({completados.length})
          </summary>
          <div className="grid gap-3 mt-3">
            {completados.map((it) => (
              <EventoCard
                key={it.id}
                item={it}
                eventoOriginal={
                  it.origen === 'custom'
                    ? eventoCustomById.get(it.origen_id)
                    : undefined
                }
                members={members}
                mascotas={mascotas}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
