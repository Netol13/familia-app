'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { ServicioFormDialog } from './ServicioFormDialog'
import { deleteServicio, marcarContactado } from '../actions'
import type { Servicio } from '@/lib/types'

function digits(s: string | null): string | null {
  if (!s) return null
  const d = s.replace(/\D/g, '')
  return d.length === 0 ? null : d
}

function formatPhoneForWa(d: string): string {
  if (d.startsWith('54')) return d
  if (d.startsWith('11') || d.startsWith('15')) return `549${d.replace(/^15/, '')}`
  if (d.length === 10) return `549${d}`
  return d
}

function formatFecha(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function ServicioCard({
  servicio,
  rubrosExistentes,
}: {
  servicio: Servicio
  rubrosExistentes: string[]
}) {
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const tel = digits(servicio.telefono)
  const wa = digits(servicio.whatsapp) ?? tel
  const waFormatted = wa ? formatPhoneForWa(wa) : null

  function handleDelete() {
    startTransition(async () => {
      await deleteServicio(servicio.id)
    })
  }

  function handleMarcarContactado() {
    startTransition(async () => {
      await marcarContactado(servicio.id)
    })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg leading-tight truncate">
              {servicio.nombre}
            </h3>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-0.5">
              {servicio.rubro}
            </p>
          </div>
          <ServicioFormDialog
            servicio={servicio}
            rubrosExistentes={rubrosExistentes}
            trigger={
              <Button variant="ghost" size="sm" className="shrink-0">
                ✏️
              </Button>
            }
          />
        </div>

        {servicio.direccion && (
          <p className="text-sm text-muted-foreground">📍 {servicio.direccion}</p>
        )}
        {servicio.notas && (
          <p className="text-sm whitespace-pre-wrap">{servicio.notas}</p>
        )}
        {servicio.ultimo_contacto && (
          <p className="text-xs text-muted-foreground">
            Último contacto: {formatFecha(servicio.ultimo_contacto)}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {tel && (
            <a
              href={`tel:${tel}`}
              onClick={handleMarcarContactado}
              className={buttonVariants({ size: 'sm', variant: 'default' })}
            >
              📞 Llamar
            </a>
          )}
          {waFormatted && (
            <a
              href={`https://wa.me/${waFormatted}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMarcarContactado}
              className={buttonVariants({ size: 'sm', variant: 'secondary' })}
            >
              💬 WhatsApp
            </a>
          )}
          {confirmDelete ? (
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
          )}
        </div>
      </CardContent>
    </Card>
  )
}
