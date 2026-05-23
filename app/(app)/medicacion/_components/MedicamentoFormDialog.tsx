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
import { HorariosEditor } from './HorariosEditor'
import { createMedicamento, updateMedicamento } from '../actions'
import type { Medicamento } from '@/lib/types'

type Props = {
  trigger: React.ReactElement
  medicamento?: Medicamento
  personasExistentes?: string[]
  personaPredefinida?: string
}

export function MedicamentoFormDialog({
  trigger,
  medicamento,
  personasExistentes = [],
  personaPredefinida,
}: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!medicamento

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateMedicamento(medicamento!.id, formData)
        } else {
          await createMedicamento(formData)
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
          <DialogTitle>
            {isEdit ? 'Editar medicamento' : 'Nuevo medicamento'}
          </DialogTitle>
          <DialogDescription>
            Datos del medicamento. Persona y nombre son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona">Persona *</Label>
            <Input
              id="persona"
              name="persona"
              required
              defaultValue={medicamento?.persona ?? personaPredefinida ?? ''}
              placeholder="Marcelo, Abuelo José, Mamá..."
              list="personas-existentes"
              autoCapitalize="words"
            />
            <datalist id="personas-existentes">
              {personasExistentes.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombre_medicamento">Medicamento *</Label>
            <Input
              id="nombre_medicamento"
              name="nombre_medicamento"
              required
              defaultValue={medicamento?.nombre_medicamento ?? ''}
              placeholder="Enalapril, Aspirina..."
              autoCapitalize="words"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dosis">Dosis</Label>
              <Input
                id="dosis"
                name="dosis"
                defaultValue={medicamento?.dosis ?? ''}
                placeholder="10mg, 1 comp..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frecuencia">Frecuencia</Label>
              <Input
                id="frecuencia"
                name="frecuencia"
                defaultValue={medicamento?.frecuencia ?? ''}
                placeholder="1 vez al día"
              />
            </div>
          </div>

          <HorariosEditor defaultValue={medicamento?.horario ?? []} />

          <div className="space-y-2">
            <Label htmlFor="recetado_por">Recetado por</Label>
            <Input
              id="recetado_por"
              name="recetado_por"
              defaultValue={medicamento?.recetado_por ?? ''}
              placeholder="Dr. González, cardiólogo..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              defaultValue={medicamento?.notas ?? ''}
              placeholder="Tomar con comida, no combinar con X..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border p-3">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              defaultChecked={medicamento?.activo ?? true}
              className="size-4 accent-foreground"
            />
            <Label htmlFor="activo" className="cursor-pointer font-normal">
              Está tomando este medicamento actualmente
            </Label>
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
