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
import { uploadDocumento, updateDocumentoMetadata } from '../actions'
import {
  TIPOS_DOCUMENTO,
  type Documento,
  type FamilyMemberLite,
  type MascotaLite,
} from '@/lib/types'

const LABEL_TIPO: Record<(typeof TIPOS_DOCUMENTO)[number], string> = {
  factura: 'Factura',
  garantia: 'Garantía',
  receta: 'Receta médica',
  contrato: 'Contrato',
  manual: 'Manual',
  seguro: 'Seguro',
  otro: 'Otro',
}

type Props = {
  trigger: React.ReactElement
  documento?: Documento
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
}

const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export function DocumentoFormDialog({ trigger, documento, members, mascotas }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!documento

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateDocumentoMetadata(documento!.id, formData)
        } else {
          await uploadDocumento(formData)
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
          <DialogTitle>{isEdit ? 'Editar documento' : 'Subir documento'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cambiá los datos del documento. El archivo subido no se reemplaza.'
              : 'Máximo 10 MB. PDF, imágenes, Word y Excel.'}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="archivo">Archivo *</Label>
              <Input
                id="archivo"
                name="archivo"
                type="file"
                required
                accept="application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              name="nombre"
              required
              defaultValue={documento?.nombre ?? ''}
              placeholder="Factura Edenor enero"
              autoCapitalize="sentences"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo *</Label>
            <select
              id="tipo"
              name="tipo"
              required
              defaultValue={documento?.tipo ?? 'otro'}
              className={selectClass}
            >
              {TIPOS_DOCUMENTO.map((t) => (
                <option key={t} value={t}>
                  {LABEL_TIPO[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              defaultValue={documento?.descripcion ?? ''}
              placeholder="De qué se trata el documento"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="persona_id">Persona</Label>
              <select
                id="persona_id"
                name="persona_id"
                defaultValue={documento?.persona_id ?? ''}
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
                defaultValue={documento?.mascota_id ?? ''}
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fecha_documento">Fecha del documento</Label>
              <Input
                id="fecha_documento"
                name="fecha_documento"
                type="date"
                defaultValue={documento?.fecha_documento ?? ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vencimiento">Vencimiento</Label>
              <Input
                id="vencimiento"
                name="vencimiento"
                type="date"
                defaultValue={documento?.vencimiento ?? ''}
              />
            </div>
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
              {pending
                ? isEdit
                  ? 'Guardando...'
                  : 'Subiendo...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Subir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
