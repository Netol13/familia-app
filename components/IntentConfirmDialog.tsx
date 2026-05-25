'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createCompra } from '@/app/(app)/compras/actions'
import { createMedicamento } from '@/app/(app)/medicacion/actions'
import { createEvento } from '@/app/(app)/calendario/actions'
import { createServicio } from '@/app/(app)/servicios/actions'
import { createEvento as createMascotaEvento } from '@/app/(app)/mascotas/actions'
import type { AudioIntent, IntentResult } from '@/lib/audio-intent'

const CATEGORY_INFO: Record<string, { label: string; emoji: string }> = {
  compras: { label: 'Compras', emoji: '🛒' },
  servicios: { label: 'Servicios', emoji: '🔧' },
  medicacion: { label: 'Medicación', emoji: '💊' },
  eventos: { label: 'Agenda', emoji: '📅' },
  mascota_evento: { label: 'Mascotas', emoji: '🐾' },
  desconocido: { label: 'Sin categoría', emoji: '❓' },
}

function buildFormData(intent: AudioIntent, mascotaId?: string): FormData {
  const fd = new FormData()

  switch (intent.category) {
    case 'compras':
      fd.set('item', intent.item)
      if (intent.cantidad) fd.set('cantidad', intent.cantidad)
      if (intent.categoria) fd.set('categoria', intent.categoria)
      if (intent.notas) fd.set('notas', intent.notas)
      break

    case 'servicios':
      fd.set('nombre', intent.nombre)
      fd.set('rubro', intent.rubro ?? '')
      if (intent.telefono) fd.set('telefono', intent.telefono)
      if (intent.notas) fd.set('notas', intent.notas)
      break

    case 'medicacion':
      fd.set('persona', intent.persona)
      fd.set('nombre_medicamento', intent.nombre_medicamento)
      if (intent.dosis) fd.set('dosis', intent.dosis)
      if (intent.frecuencia) fd.set('frecuencia', intent.frecuencia)
      if (intent.horario?.length) fd.set('horario', intent.horario.join(','))
      if (intent.notas) fd.set('notas', intent.notas)
      fd.set('activo', 'true')
      break

    case 'eventos':
      fd.set('titulo', intent.titulo)
      fd.set('fecha', intent.fecha)
      fd.set('tipo', intent.tipo ?? 'otro')
      if (intent.descripcion) fd.set('descripcion', intent.descripcion)
      if (intent.recurrente_anual) fd.set('recurrente_anual', 'true')
      if (intent.anio_nacimiento) {
        fd.set('edad_actual', String(new Date().getFullYear() - intent.anio_nacimiento))
      }
      break

    case 'mascota_evento':
      fd.set('mascota_id', mascotaId ?? '')
      fd.set('tipo', intent.tipo)
      fd.set('fecha', intent.fecha ?? new Date().toISOString().slice(0, 10))
      if (intent.detalle) fd.set('detalle', intent.detalle)
      if (intent.proxima_fecha) fd.set('proxima_fecha', intent.proxima_fecha)
      break
  }

  return fd
}

function IntentFields({ intent }: { intent: AudioIntent }) {
  const rows: [string, string][] = []

  switch (intent.category) {
    case 'compras':
      rows.push(['Producto', intent.item])
      if (intent.cantidad) rows.push(['Cantidad', intent.cantidad])
      if (intent.categoria) rows.push(['Categoría', intent.categoria])
      if (intent.notas) rows.push(['Notas', intent.notas])
      break
    case 'servicios':
      rows.push(['Nombre', intent.nombre])
      if (intent.rubro) rows.push(['Rubro', intent.rubro])
      if (intent.telefono) rows.push(['Teléfono', intent.telefono])
      if (intent.notas) rows.push(['Notas', intent.notas])
      break
    case 'medicacion':
      rows.push(['Para', intent.persona])
      rows.push(['Medicamento', intent.nombre_medicamento])
      if (intent.dosis) rows.push(['Dosis', intent.dosis])
      if (intent.frecuencia) rows.push(['Frecuencia', intent.frecuencia])
      if (intent.horario?.length) rows.push(['Horario', intent.horario.join(', ')])
      if (intent.notas) rows.push(['Notas', intent.notas])
      break
    case 'eventos':
      rows.push(['Título', intent.titulo])
      rows.push(['Fecha', intent.fecha])
      if (intent.tipo) rows.push(['Tipo', intent.tipo])
      if (intent.descripcion) rows.push(['Descripción', intent.descripcion])
      break
    case 'mascota_evento':
      rows.push(['Mascota', intent.nombre_mascota])
      rows.push(['Tipo', intent.tipo])
      if (intent.fecha) rows.push(['Fecha', intent.fecha])
      if (intent.detalle) rows.push(['Detalle', intent.detalle])
      if (intent.proxima_fecha) rows.push(['Próxima fecha', intent.proxima_fecha])
      break
    case 'desconocido':
      rows.push(['Mensaje', intent.mensaje])
      break
  }

  return (
    <dl className="space-y-1 text-sm">
      {rows.map(([key, val]) => (
        <div key={key} className="flex gap-2">
          <dt className="text-muted-foreground min-w-[90px] shrink-0">{key}:</dt>
          <dd className="font-medium break-words">{val}</dd>
        </div>
      ))}
    </dl>
  )
}

type Props = {
  result: IntentResult
  mascotas: Array<{ id: string; nombre: string }>
  onClose: () => void
}

export function IntentConfirmDialog({ result, mascotas, onClose }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const { intent, confidence, summary, transcript } = result
  const categoryInfo = CATEGORY_INFO[intent.category] ?? { label: intent.category, emoji: '❓' }

  // Resolver mascota_id por nombre
  const mascotaResuelta =
    intent.category === 'mascota_evento'
      ? mascotas.find(
          (m) => m.nombre.toLowerCase() === intent.nombre_mascota?.toLowerCase()
        )
      : undefined

  const [selectedMascotaId, setSelectedMascotaId] = useState(mascotaResuelta?.id ?? '')

  const canConfirm =
    intent.category !== 'desconocido' &&
    (intent.category !== 'mascota_evento' || !!selectedMascotaId)

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      try {
        const mascotaId =
          intent.category === 'mascota_evento' ? selectedMascotaId : undefined
        const fd = buildFormData(intent, mascotaId)

        switch (intent.category) {
          case 'compras':
            await createCompra(fd)
            break
          case 'medicacion':
            await createMedicamento(fd)
            break
          case 'eventos':
            await createEvento(fd)
            break
          case 'servicios':
            await createServicio(fd)
            break
          case 'mascota_evento':
            await createMascotaEvento(fd)
            break
          default:
            return
        }

        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{categoryInfo.emoji}</span>
            <span>{categoryInfo.label}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm font-medium">{summary}</p>

          <p className="text-xs text-muted-foreground italic">"{transcript}"</p>

          {confidence < 0.6 && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-700 dark:text-amber-400">
              ⚠️ No estoy muy seguro — revisá los datos antes de guardar.
            </div>
          )}

          <IntentFields intent={intent} />

          {intent.category === 'mascota_evento' && !mascotaResuelta && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">¿De qué mascota?</p>
              {mascotas.length === 0 ? (
                <p className="text-xs text-destructive">
                  Primero creá una mascota en la sección Mascotas.
                </p>
              ) : (
                <select
                  value={selectedMascotaId}
                  onChange={(e) => setSelectedMascotaId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                >
                  <option value="">— Elegí una mascota —</option>
                  {mascotas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm || pending}>
            {pending ? 'Guardando...' : 'Confirmar y guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
