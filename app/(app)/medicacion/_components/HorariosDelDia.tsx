'use client'

import type { Medicamento } from '@/lib/types'

type Toma = {
  hora: string
  medicamento: string
  persona: string
  dosis: string | null
}

const HHMM = /^\d{2}:\d{2}$/

function rank(h: string): number {
  if (HHMM.test(h)) {
    const [hh, mm] = h.split(':').map(Number)
    return hh * 60 + mm
  }
  if (h === 'Mañana') return 7 * 60
  if (h === 'Tarde') return 14 * 60
  if (h === 'Noche') return 21 * 60
  return 99 * 60
}

function icon(h: string): string {
  if (h === 'Mañana') return '🌅'
  if (h === 'Tarde') return '☀️'
  if (h === 'Noche') return '🌙'
  return '🕐'
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
  tomas.sort((a, b) => rank(a.hora) - rank(b.hora))

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
            <div className="text-sm font-medium w-20 shrink-0 text-foreground flex items-center gap-1">
              <span>{icon(hora)}</span>
              <span className={HHMM.test(hora) ? 'font-mono tabular-nums' : ''}>
                {hora}
              </span>
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
