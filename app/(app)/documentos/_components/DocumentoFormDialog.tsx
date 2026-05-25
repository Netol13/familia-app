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
import { useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button, buttonVariants } from '@/components/ui/button'
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

const ACCEPT_ARCHIVO =
  'application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

function stampNombre(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `Foto ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function DocumentoFormDialog({ trigger, documento, members, mascotas }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const nombreInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!documento

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>, esFoto: boolean) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    // Limpiar el otro input para que no envíe blob de 0 bytes
    if (esFoto && fileInputRef.current) fileInputRef.current.value = ''
    if (!esFoto && cameraInputRef.current) cameraInputRef.current.value = ''
    // Auto-rellenar nombre si está vacío
    if (nombreInputRef.current && !nombreInputRef.current.value.trim()) {
      nombreInputRef.current.value = esFoto ? stampNombre() : file.name.replace(/\.[^.]+$/, '')
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null)
    // Borrar entries 'archivo' vacías (blobs de 0 bytes de inputs no tocados)
    const archivos = formData.getAll('archivo')
    formData.delete('archivo')
    const valido = archivos.find((a) => a instanceof File && a.size > 0)
    if (valido) formData.append('archivo', valido)

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateDocumentoMetadata(documento!.id, formData)
        } else {
          await uploadDocumento(formData)
        }
        setOpen(false)
        setFileName(null)
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
              <Label>Archivo *</Label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' cursor-pointer'}
                >
                  <span>📁 Subir archivo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="archivo"
                    accept={ACCEPT_ARCHIVO}
                    className="hidden"
                    onChange={(e) => onPickFile(e, false)}
                  />
                </label>
                <label
                  className={buttonVariants({ variant: 'outline', size: 'lg' }) + ' cursor-pointer'}
                >
                  <span>📷 Sacar foto</span>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    name="archivo"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onPickFile(e, true)}
                  />
                </label>
              </div>
              {fileName && (
                <p className="text-xs text-muted-foreground">📎 {fileName}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              ref={nombreInputRef}
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
