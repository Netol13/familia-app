'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { MascotaFormDialog } from './MascotaFormDialog'
import { EventoFormDialog } from './EventoFormDialog'
import { deleteMascota, deleteEvento } from '../actions'
import type { Mascota, MascotaEvento } from '@/lib/types'

function emojiForEspecie(especie: string | null): string {
  const e = especie?.toLowerCase() ?? ''
  if (e.includes('perro')) return '🐶'
  if (e.includes('gato')) return '🐱'
  if (e.includes('pájaro') || e.includes('pajaro')) return '🐦'
  if (e.includes('conejo')) return '🐰'
  if (e.includes('tortuga')) return '🐢'
  if (e.includes('pez')) return '🐟'
  if (e.includes('hamster') || e.includes('hámster')) return '🐹'
  return '🐾'
}

function emojiForTipo(tipo: string): string {
  const t = tipo.toLowerCase()
  if (t === 'vacuna') return '💉'
  if (t === 'control') return '🩺'
  if (t === 'antiparasitario') return '🪱'
  if (t === 'peso') return '⚖️'
  if (t === 'baño') return '🛁'
  return '📌'
}

function formatFecha(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function edadDesde(iso: string | null): string | null {
  if (!iso) return null
  const nac = new Date(iso)
  const hoy = new Date()
  let años = hoy.getFullYear() - nac.getFullYear()
  let meses = hoy.getMonth() - nac.getMonth()
  if (hoy.getDate() < nac.getDate()) meses -= 1
  if (meses < 0) {
    años -= 1
    meses += 12
  }
  if (años === 0) return `${meses} mes${meses === 1 ? '' : 'es'}`
  if (meses === 0) return `${años} año${años === 1 ? '' : 's'}`
  return `${años} año${años === 1 ? '' : 's'} ${meses}m`
}

function diasHasta(iso: string): number {
  const target = new Date(iso)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - hoy.getTime()) / 86400000)
}

export function MascotaCard({
  mascota,
  eventos,
}: {
  mascota: Mascota
  eventos: MascotaEvento[]
}) {
  const [pending, startTransition] = useTransition()
  const [confirmDeleteMascota, setConfirmDeleteMascota] = useState(false)
  const [expandido, setExpandido] = useState(false)

  function handleDeleteMascota() {
    startTransition(async () => {
      await deleteMascota(mascota.id)
    })
  }

  function handleDeleteEvento(id: string) {
    startTransition(async () => {
      await deleteEvento(id)
    })
  }

  const eventosOrdenados = [...eventos].sort((a, b) =>
    b.fecha.localeCompare(a.fecha)
  )
  const eventosMostrados = expandido
    ? eventosOrdenados
    : eventosOrdenados.slice(0, 3)

  const proximosEventos = eventos
    .filter((e) => e.proxima_fecha)
    .map((e) => ({ ...e, dias: diasHasta(e.proxima_fecha!) }))
    .filter((e) => e.dias >= -7)
    .sort((a, b) => a.dias - b.dias)

  const proximaUrgente = proximosEventos[0]
  const telVet = mascota.veterinario_telefono?.replace(/\D/g, '')

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <span className="text-4xl leading-none shrink-0">
              {emojiForEspecie(mascota.especie)}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg leading-tight">
                {mascota.nombre}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {[mascota.raza, mascota.especie, edadDesde(mascota.fecha_nacimiento)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <MascotaFormDialog
            mascota={mascota}
            trigger={
              <Button variant="ghost" size="sm" className="shrink-0">
                ✏️
              </Button>
            }
          />
        </div>

        {proximaUrgente && (
          <div
            className={`rounded-lg border p-2.5 text-sm flex items-center gap-2 ${
              proximaUrgente.dias < 0
                ? 'border-destructive/40 bg-destructive/10 text-destructive'
                : proximaUrgente.dias <= 7
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                : 'border-border bg-muted/50 text-muted-foreground'
            }`}
          >
            <span>{emojiForTipo(proximaUrgente.tipo)}</span>
            <span className="flex-1">
              <strong className="capitalize">{proximaUrgente.tipo}</strong>{' '}
              {proximaUrgente.dias < 0
                ? `vencida hace ${Math.abs(proximaUrgente.dias)} día${Math.abs(proximaUrgente.dias) === 1 ? '' : 's'}`
                : proximaUrgente.dias === 0
                ? 'es hoy'
                : `en ${proximaUrgente.dias} día${proximaUrgente.dias === 1 ? '' : 's'}`}
              {' '}({formatFecha(proximaUrgente.proxima_fecha)})
            </span>
          </div>
        )}

        {mascota.alimento && (
          <p className="text-sm">
            <span className="text-muted-foreground">🥣 </span>
            {mascota.alimento}
          </p>
        )}
        {mascota.veterinario_nombre && (
          <div className="text-sm flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground">🩺</span>
            <span>{mascota.veterinario_nombre}</span>
            {telVet && (
              <a
                href={`tel:${telVet}`}
                className={buttonVariants({ size: 'xs', variant: 'outline' })}
              >
                📞 Llamar
              </a>
            )}
          </div>
        )}
        {mascota.notas && (
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">
            {mascota.notas}
          </p>
        )}

        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">
              Historia ({eventos.length})
            </h4>
            <EventoFormDialog
              mascotaId={mascota.id}
              mascotaNombre={mascota.nombre}
              trigger={
                <Button size="sm" variant="outline">
                  + Evento
                </Button>
              }
            />
          </div>

          {eventos.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Sin eventos cargados todavía.
            </p>
          ) : (
            <>
              <ul className="space-y-1.5">
                {eventosMostrados.map((e) => (
                  <li key={e.id} className="text-sm flex items-start gap-2 group">
                    <span className="shrink-0">{emojiForTipo(e.tipo)}</span>
                    <span className="text-muted-foreground tabular-nums text-xs shrink-0 mt-0.5">
                      {formatFecha(e.fecha)}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="capitalize font-medium">{e.tipo}</span>
                      {e.detalle && <span className="text-muted-foreground"> · {e.detalle}</span>}
                      {e.proxima_fecha && (
                        <span className="text-xs text-muted-foreground block">
                          ↻ próxima: {formatFecha(e.proxima_fecha)}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEvento(e.id)}
                      disabled={pending}
                      className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-destructive transition-opacity"
                      title="Eliminar evento"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              {eventosOrdenados.length > 3 && (
                <button
                  type="button"
                  onClick={() => setExpandido(!expandido)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {expandido
                    ? '← Ver menos'
                    : `Ver todos (${eventosOrdenados.length}) →`}
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end pt-1">
          {confirmDeleteMascota ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteMascota}
                disabled={pending}
              >
                {pending ? '...' : 'Eliminar todo'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmDeleteMascota(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDeleteMascota(true)}
            >
              🗑 Eliminar mascota
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
