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
import { createServicio, updateServicio } from '../actions'
import type { Servicio } from '@/lib/types'

type Props = {
  trigger: React.ReactElement
  servicio?: Servicio
  rubrosExistentes?: string[]
}

export function ServicioFormDialog({ trigger, servicio, rubrosExistentes = [] }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!servicio

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateServicio(servicio!.id, formData)
        } else {
          await createServicio(formData)
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
          <DialogTitle>{isEdit ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          <DialogDescription>
            Datos del contacto. Solo nombre y rubro son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              defaultValue={servicio?.nombre ?? ''}
              placeholder="Juan el plomero"
              autoCapitalize="words"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rubro">Rubro *</Label>
            <Input
              id="rubro"
              name="rubro"
              required
              defaultValue={servicio?.rubro ?? ''}
              placeholder="plomero, electricista, piletero..."
              list="rubros-existentes"
              autoCapitalize="none"
            />
            <datalist id="rubros-existentes">
              {rubrosExistentes.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                defaultValue={servicio?.telefono ?? ''}
                placeholder="11 5555 5555"
                inputMode="tel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                defaultValue={servicio?.whatsapp ?? ''}
                placeholder="11 5555 5555"
                inputMode="tel"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              name="direccion"
              defaultValue={servicio?.direccion ?? ''}
              placeholder="Av. Siempre Viva 742"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              name="notas"
              defaultValue={servicio?.notas ?? ''}
              placeholder="Viene los miércoles, cobra en efectivo, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ultimo_contacto">Último contacto</Label>
            <Input
              id="ultimo_contacto"
              name="ultimo_contacto"
              type="date"
              defaultValue={servicio?.ultimo_contacto ?? ''}
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
