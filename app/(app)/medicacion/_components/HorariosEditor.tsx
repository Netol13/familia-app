'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const QUICK_OPTIONS = [
  { value: 'Mañana', icon: '🌅' },
  { value: 'Tarde', icon: '☀️' },
  { value: 'Noche', icon: '🌙' },
]

function iconFor(h: string): string {
  const found = QUICK_OPTIONS.find((q) => q.value === h)
  if (found) return found.icon
  return '🕐'
}

export function HorariosEditor({
  defaultValue = [],
  name = 'horario',
}: {
  defaultValue?: string[]
  name?: string
}) {
  const [horarios, setHorarios] = useState<string[]>(defaultValue)
  const [draft, setDraft] = useState('')

  function addHorario(value: string) {
    const h = value.trim()
    if (!h) return
    if (horarios.includes(h)) return
    setHorarios([...horarios, h])
  }

  function addFromInput() {
    addHorario(draft)
    setDraft('')
  }

  function removeHorario(h: string) {
    setHorarios(horarios.filter((x) => x !== h))
  }

  return (
    <div className="space-y-2">
      <Label>Horarios</Label>
      <input type="hidden" name={name} value={horarios.join(',')} />

      <p className="text-xs text-muted-foreground">
        Opcional. Podés dejarlo vacío si no hace falta horario fijo.
      </p>

      <div className="flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((q) => {
          const active = horarios.includes(q.value)
          return (
            <button
              key={q.value}
              type="button"
              onClick={() =>
                active ? removeHorario(q.value) : addHorario(q.value)
              }
              className={`text-sm px-3 py-1.5 rounded-full border transition-colors flex items-center gap-1.5 ${
                active
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground hover:bg-accent'
              }`}
            >
              <span>{q.icon}</span>
              <span>{q.value}</span>
            </button>
          )
        })}
      </div>

      <div className="flex gap-2 pt-1">
        <Input
          type="time"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addFromInput()
            }
          }}
          className="flex-1"
          placeholder="Hora específica"
        />
        <Button type="button" variant="outline" onClick={addFromInput}>
          + Hora
        </Button>
      </div>

      {horarios.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {horarios.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => removeHorario(h)}
              className="text-xs px-2.5 py-1 rounded-full border bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors flex items-center gap-1.5"
              title="Click para eliminar"
            >
              <span>{iconFor(h)}</span>
              <span>{h}</span>
              <span className="text-xs opacity-60">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
