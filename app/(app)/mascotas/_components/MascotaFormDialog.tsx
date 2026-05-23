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
import { createMascota, updateMascota } from '../actions'
import type { Mascota } from '@/lib/types'

type Props = {
  trigger: React.ReactElement
  mascota?: Mascota
}

export function MascotaFormDialog({ trigger, mascota }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!mascota

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateMascota(mascota!.id, formData)
        } else {
          await createMascota(formData)
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
          <DialogTitle>{isEdit ? 'Editar mascota' : 'Nueva mascota'}</DialogTitle>
          <DialogDescription>
            Datos básicos. Solo el nombre es obligatorio.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              defaultValue={mascota?.nombre ?? ''}
              placeholder="Toby, Luna..."
              autoCapitalize="words"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="especie">Especie</Label>
              <Input
                id="especie"
                name="especie"
                defaultValue={mascota?.especie ?? ''}
                placeholder="perro, gato..."
                list="especies-comunes"
              />
              <datalist id="especies-comunes">
                <option value="perro" />
                <option value="gato" />
                <option value="pájaro" />
                <option value="conejo" />
                <option value="tortuga" />
                <option value="pez" />
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="raza">Raza</Label>
              <Input
                id="raza"
                name="raza"
                defaultValue={mascota?.raza ?? ''}
                placeholder="Labrador, mestizo..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de nacimiento</Label>
            <Input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              defaultValue={mascota?.fecha_nacimiento ?? ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="veterinario_nombre">Veterinario</Label>
              <Input
                id="veterinario_nombre"
                name="veterinario_nombre"
                defaultValue={mascota?.veterinario_nombre ?? ''}
                placeholder="Dr. Pérez"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinario_telefono">Tel. veterinario</Label>
              <Input
                id="veterinario_telefono"
                name="veterinario_telefono"
                type="tel"
                inputMode="tel"
                defaultValue={mascota?.veterinario_telefono ?? ''}
                placeholder="11 5555 5555"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alimento">Alimento</Label>
            <Input
              id="alimento"
              name="alimento"
              defaultValue={mascota?.alimento ?? ''}
              placeholder="Pro Plan adulto chico, 2 medidas/día..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              defaultValue={mascota?.notas ?? ''}
              placeholder="Alergias, manías, peso ideal..."
              rows={3}
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
