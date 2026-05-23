'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MedicamentoFormDialog } from './MedicamentoFormDialog'
import { deleteMedicamento, toggleActivo } from '../actions'
import type { Medicamento } from '@/lib/types'

export function MedicamentoCard({
  medicamento,
  personasExistentes,
}: {
  medicamento: Medicamento
  personasExistentes: string[]
}) {
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    startTransition(async () => {
      await deleteMedicamento(medicamento.id)
    })
  }

  function handleToggleActivo() {
    startTransition(async () => {
      await toggleActivo(medicamento.id, medicamento.activo)
    })
  }

  return (
    <Card className={medicamento.activo ? '' : 'opacity-60'}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={`font-semibold text-lg leading-tight ${
                  medicamento.activo ? '' : 'line-through'
                }`}
              >
                {medicamento.nombre_medicamento}
              </h3>
              {!medicamento.activo && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  discontinuado
                </span>
              )}
            </div>
            {(medicamento.dosis || medicamento.frecuencia) && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {[medicamento.dosis, medicamento.frecuencia]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <MedicamentoFormDialog
            medicamento={medicamento}
            personasExistentes={personasExistentes}
            trigger={
              <Button variant="ghost" size="sm" className="shrink-0">
                ✏️
              </Button>
            }
          />
        </div>

        {medicamento.horario && medicamento.horario.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {medicamento.horario.map((h) => {
              const icon =
                h === 'Mañana' ? '🌅' :
                h === 'Tarde' ? '☀️' :
                h === 'Noche' ? '🌙' : '🕐'
              return (
                <span
                  key={h}
                  className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                >
                  {icon} {h}
                </span>
              )
            })}
          </div>
        )}

        {medicamento.recetado_por && (
          <p className="text-xs text-muted-foreground">
            Recetado por: {medicamento.recetado_por}
          </p>
        )}
        {medicamento.notas && (
          <p className="text-sm whitespace-pre-wrap pt-1">{medicamento.notas}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant={medicamento.activo ? 'outline' : 'default'}
            onClick={handleToggleActivo}
            disabled={pending}
          >
            {medicamento.activo ? '⏸ Discontinuar' : '▶ Reactivar'}
          </Button>

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
