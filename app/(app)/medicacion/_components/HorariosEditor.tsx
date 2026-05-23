'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function HorariosEditor({
  defaultValue = [],
  name = 'horario',
}: {
  defaultValue?: string[]
  name?: string
}) {
  const [horarios, setHorarios] = useState<string[]>(defaultValue)
  const [draft, setDraft] = useState('')

  function addHorario() {
    const h = draft.trim()
    if (!h) return
    if (horarios.includes(h)) {
      setDraft('')
      return
    }
    const nuevos = [...horarios, h].sort()
    setHorarios(nuevos)
    setDraft('')
  }

  function removeHorario(h: string) {
    setHorarios(horarios.filter((x) => x !== h))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="horario-input">Horarios</Label>
      <input type="hidden" name={name} value={horarios.join(',')} />

      <div className="flex gap-2">
        <Input
          id="horario-input"
          type="time"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addHorario()
            }
          }}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={addHorario}>
          + Agregar
        </Button>
      </div>

      {horarios.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {horarios.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => removeHorario(h)}
              className="text-xs px-2.5 py-1 rounded-full border bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 transition-colors flex items-center gap-1.5"
              title="Click para eliminar"
            >
              <span>🕐</span>
              <span>{h}</span>
              <span className="text-xs opacity-60">×</span>
            </button>
          ))}
        </div>
      )}
      {horarios.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Opcional. Podés agregar varios horarios (ej: 08:00, 14:00, 20:00).
        </p>
      )}
    </div>
  )
}
