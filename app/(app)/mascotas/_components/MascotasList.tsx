'use client'

import { Button } from '@/components/ui/button'
import { MascotaCard } from './MascotaCard'
import { MascotaFormDialog } from './MascotaFormDialog'
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
        <div className="text-center py-12 text-muted-foreground text-sm">
          Todavía no hay mascotas. Tocá "+ Nueva mascota" para agregar la primera.
        </div>
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
