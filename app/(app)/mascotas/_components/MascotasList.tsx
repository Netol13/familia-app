'use client'

import { Button } from '@/components/ui/button'
import { MascotaCard } from './MascotaCard'
import { MascotaFormDialog } from './MascotaFormDialog'
import { EmptyState } from '@/components/EmptyState'
import type { Mascota, MascotaEvento } from '@/lib/types'

export function MascotasList({
  mascotas,
  eventosPorMascota,
}: {
  mascotas: Mascota[]
  eventosPorMascota: Record<string, MascotaEvento[]>
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <MascotaFormDialog
          trigger={<Button>+ Nueva mascota</Button>}
        />
      </div>

      {mascotas.length === 0 ? (
        <EmptyState
          emoji="🐾"
          title="Sin mascotas"
          description="Cargá los datos de las mascotas para llevar el control de vacunas, controles y peso."
          action={
            <MascotaFormDialog
              trigger={<Button>+ Agregar la primera</Button>}
            />
          }
        />
      ) : (
        <div className="grid gap-4">
          {mascotas.map((m) => (
            <MascotaCard
              key={m.id}
              mascota={m}
              eventos={eventosPorMascota[m.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  )
}
