'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createEvento, updateEvento } from '../actions'
import {
  TIPOS_EVENTO,
  type Evento,
  type FamilyMemberLite,
  type MascotaLite,
  type TipoEvento,
} from '@/lib/types'

const LABEL_TIPO: Record<TipoEvento, string> = {
  cumple: '🎂 Cumpleaños',
  vencimiento: '⚠️ Vencimiento',
  turno: '🩺 Turno',
  otro: '📅 Otro',
}

type Props = {
  trigger: React.ReactElement
  evento?: Evento
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
}

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export function EventoFormDialog({ trigger, evento, members, mascotas }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tipoActual, setTipoActual] = useState<TipoEvento>(evento?.tipo ?? 'cumple')
  const [recurrente, setRecurrente] = useState<boolean>(evento?.recurrente_anual ?? true)
  const isEdit = !!evento

  function handleTipoChange(nuevo: TipoEvento) {
    setTipoActual(nuevo)
    // Si deja de ser cumple, el checkbox recurrente se desactiva
    if (nuevo !== 'cumple') setRecurrente(false)
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateEvento(evento!.id, formData)
        } else {
          await createEvento(formData)
        }
        setOpen(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
          <DialogDescription>
            Cumpleaños, vencimientos, turnos médicos o cualquier fecha importante.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              name="titulo"
              required
              defaultValue={evento?.titulo ?? ''}
              placeholder="Cumple de Marcelo · Turno cardiólogo · ..."
              autoCapitalize="sentences"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <select
                id="tipo"
                name="tipo"
                required
                value={tipoActual}
                onChange={(e) => handleTipoChange(e.target.value as TipoEvento)}
                className={selectClass}
              >
                {TIPOS_EVENTO.map((t) => (
                  <option key={t} value={t}>
                    {LABEL_TIPO[t]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                required
                defaultValue={evento?.fecha ?? ''}
              />
            </div>
          </div>

          {tipoActual === 'cumple' && (
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                name="recurrente_anual"
                checked={recurrente}
                onChange={(e) => setRecurrente(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-input"
              />
              <span>
                Se repite cada año
                <span className="block text-xs text-muted-foreground">
                  Para cumpleaños, aniversarios. La app muestra siempre la próxima ocurrencia.
                </span>
              </span>
            </label>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="persona_id">Persona</Label>
              <select
                id="persona_id"
                name="persona_id"
                defaultValue={evento?.persona_id ?? ''}
                className={selectClass}
              >
                <option value="">— ninguna —</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mascota_id">Mascota</Label>
              <select
                id="mascota_id"
                name="mascota_id"
                defaultValue={evento?.mascota_id ?? ''}
                className={selectClass}
              >
                <option value="">— ninguna —</option>
                {mascotas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Notas</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              defaultValue={evento?.descripcion ?? ''}
              placeholder="Detalle opcional"
              rows={2}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
