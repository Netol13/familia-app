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
import { createEvento } from '../actions'

const TIPOS_COMUNES = [
  'vacuna',
  'control',
  'antiparasitario',
  'peso',
  'baño',
  'otro',
]

type Props = {
  trigger: React.ReactElement
  mascotaId: string
  mascotaNombre: string
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function EventoFormDialog({ trigger, mascotaId, mascotaNombre }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [tipo, setTipo] = useState('vacuna')

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        await createEvento(formData)
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
          <DialogTitle>Nuevo evento — {mascotaNombre}</DialogTitle>
          <DialogDescription>
            Vacuna, control, peso, antiparasitario o lo que necesites trackear.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="mascota_id" value={mascotaId} />

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_COMUNES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors capitalize ${
                    tipo === t
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground hover:bg-accent'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input type="hidden" name="tipo" value={tipo} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha *</Label>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              required
              defaultValue={todayISO()}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalle">Detalle</Label>
            <Textarea
              id="detalle"
              name="detalle"
              placeholder={
                tipo === 'vacuna'
                  ? 'Antirrábica, sextuple...'
                  : tipo === 'peso'
                  ? 'Ej: 12.5 kg'
                  : 'Lo que quieras anotar'
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proxima_fecha">Próxima fecha (recordatorio)</Label>
            <Input
              id="proxima_fecha"
              name="proxima_fecha"
              type="date"
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Útil para vacunas/antiparasitarios que se repiten.
            </p>
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
              {pending ? 'Guardando...' : 'Crear evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
