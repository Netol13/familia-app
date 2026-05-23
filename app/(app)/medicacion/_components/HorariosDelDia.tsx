'use client'

import type { Medicamento } from '@/lib/types'

type Toma = {
  hora: string
  medicamento: string
  persona: string
  dosis: string | null
}

export function HorariosDelDia({ medicamentos }: { medicamentos: Medicamento[] }) {
  const tomas: Toma[] = []
  for (const m of medicamentos) {
    if (!m.activo) continue
    if (!m.horario || m.horario.length === 0) continue
    for (const hora of m.horario) {
      tomas.push({
        hora,
        medicamento: m.nombre_medicamento,
        persona: m.persona,
        dosis: m.dosis,
      })
    }
  }
  tomas.sort((a, b) => a.hora.localeCompare(b.hora))

  if (tomas.length === 0) return null

  const grupos = new Map<string, Toma[]>()
  for (const t of tomas) {
    if (!grupos.has(t.hora)) grupos.set(t.hora, [])
    grupos.get(t.hora)!.push(t)
  }

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">🕐 Horarios del día</h2>
        <span className="text-xs text-muted-foreground">
          {tomas.length} toma{tomas.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="space-y-2">
        {Array.from(grupos.entries()).map(([hora, lista]) => (
          <div key={hora} className="flex gap-3 items-start">
            <div className="font-mono text-sm font-medium tabular-nums w-12 shrink-0 text-foreground">
              {hora}
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              {lista.map((t, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{t.persona}:</span>{' '}
                  <span>{t.medicamento}</span>
                  {t.dosis && (
                    <span className="text-muted-foreground"> · {t.dosis}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
