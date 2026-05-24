'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EventoFormDialog } from './EventoFormDialog'
import { deleteEvento, toggleCompletado } from '../actions'
import { etiquetaRelativa, urgenciaDe } from '@/lib/calendario'
import type {
  Evento,
  EventoUnificado,
  FamilyMemberLite,
  MascotaLite,
  TipoUnificado,
} from '@/lib/types'

const ICONO_TIPO: Record<TipoUnificado, string> = {
  cumple: '🎂',
  vencimiento: '⚠️',
  turno: '🩺',
  otro: '📅',
  'doc-vence': '📕',
  'mascota-proxima': '🐾',
}

function tonoUrgencia(tono: 'vencido' | 'pronto' | 'futuro') {
  if (tono === 'vencido') return 'bg-destructive/15 text-destructive'
  if (tono === 'pronto') return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
  return 'bg-muted text-muted-foreground'
}

export function EventoCard({
  item,
  eventoOriginal,
  members,
  mascotas,
}: {
  item: EventoUnificado
  // Solo presente cuando origen === 'custom' — permite editar
  eventoOriginal?: Evento
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
}) {
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [opError, setOpError] = useState<string | null>(null)

  const urgencia = urgenciaDe(item.fecha)

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteEvento(item.origen_id)
      } catch (e) {
        setOpError(e instanceof Error ? e.message : 'Error al borrar')
        setConfirmDelete(false)
      }
    })
  }

  function handleToggle() {
    if (!eventoOriginal) return
    startTransition(async () => {
      try {
        await toggleCompletado(eventoOriginal.id, !eventoOriginal.completado)
      } catch (e) {
        setOpError(e instanceof Error ? e.message : 'Error al actualizar')
      }
    })
  }

  const esEditable = item.origen === 'custom' && eventoOriginal
  const completado = item.completado
  const recurrenteHint =
    item.origen === 'custom' && item.recurrente_anual ? ' · cada año' : ''

  return (
    <Card className={completado ? 'opacity-60' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none shrink-0">
            {ICONO_TIPO[item.tipo]}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className={`font-semibold text-lg leading-tight ${
                completado ? 'line-through' : ''
              }`}
            >
              {item.titulo}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-md ${tonoUrgencia(urgencia)}`}
              >
                {etiquetaRelativa(item.fecha)}
                {recurrenteHint}
              </span>
              {item.subtitulo && (
                <span className="text-xs text-muted-foreground">
                  {item.subtitulo}
                </span>
              )}
            </div>
          </div>
          {esEditable && (
            <EventoFormDialog
              evento={eventoOriginal}
              members={members}
              mascotas={mascotas}
              trigger={
                <Button variant="ghost" size="sm" className="shrink-0">
                  ✏️
                </Button>
              }
            />
          )}
        </div>

        {opError && <p className="text-xs text-destructive">{opError}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          {esEditable && !item.recurrente_anual && (
            <Button
              size="sm"
              variant={completado ? 'outline' : 'default'}
              onClick={handleToggle}
              disabled={pending}
            >
              {completado ? '↩ Marcar pendiente' : '✓ Marcar hecho'}
            </Button>
          )}

          {item.origen === 'documento' && (
            <Link
              href={item.href}
              className="inline-flex items-center text-xs px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              → Ver documento
            </Link>
          )}
          {item.origen === 'mascota' && (
            <Link
              href={item.href}
              className="inline-flex items-center text-xs px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              → Ver mascota
            </Link>
          )}

          {esEditable && (
            confirmDelete ? (
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={pending}
                >
                  {pending ? '...' : 'Confirmar'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                  disabled={pending}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-muted-foreground hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                🗑
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  )
}
