'use client'

import { useMemo, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/EmptyState'
import type { Compra, FamilyMemberLite } from '@/lib/types'
import { agruparPorCategoria, CATEGORIA_EMOJI, CATEGORIA_LABEL } from '@/lib/compras'
import { AgregarItemInline } from './AgregarItemInline'
import { CompraItem } from './CompraItem'
import { useComprasRealtime } from './useComprasRealtime'
import { vaciarCompletados } from '../actions'

type Props = {
  compras: Compra[]
  members: FamilyMemberLite[]
}

export function ComprasList({ compras, members }: Props) {
  useComprasRealtime()

  const [mostrarCompletados, setMostrarCompletados] = useState(false)
  const [confirmVaciar, setConfirmVaciar] = useState(false)
  const [pending, startTransition] = useTransition()

  const pendientes = useMemo(() => compras.filter((c) => !c.completado), [compras])
  const completadas = useMemo(() => compras.filter((c) => c.completado), [compras])
  const grupos = useMemo(() => agruparPorCategoria(pendientes), [pendientes])

  function handleVaciar() {
    startTransition(async () => {
      await vaciarCompletados()
      setConfirmVaciar(false)
    })
  }

  return (
    <div className="space-y-5">
      <AgregarItemInline />

      {pendientes.length === 0 && completadas.length === 0 ? (
        <EmptyState
          emoji="🛒"
          title="Lista vacía"
          description="Agregá lo que falta usando el campo de arriba. Lo verá toda la familia al instante."
        />
      ) : pendientes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          🎉 Todo comprado.
        </div>
      ) : (
        <div className="space-y-5">
          {grupos.map((g) => (
            <section key={g.categoria} className="space-y-2">
              <h2 className="text-xs uppercase tracking-wide text-muted-foreground font-medium px-1">
                <span className="mr-1.5">{CATEGORIA_EMOJI[g.categoria]}</span>
                {CATEGORIA_LABEL[g.categoria]}
                <span className="ml-2 text-muted-foreground/60">({g.items.length})</span>
              </h2>
              <div className="space-y-1.5">
                {g.items.map((c) => (
                  <CompraItem key={c.id} compra={c} members={members} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {completadas.length > 0 && (
        <section className="space-y-2 pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => setMostrarCompletados((v) => !v)}
            className="w-full text-left text-xs uppercase tracking-wide text-muted-foreground font-medium px-1 py-2 hover:text-foreground transition-colors"
          >
            {mostrarCompletados ? '▼' : '▶'} Completados ({completadas.length})
          </button>
          {mostrarCompletados && (
            <>
              <div className="space-y-1.5">
                {completadas.map((c) => (
                  <CompraItem key={c.id} compra={c} members={members} />
                ))}
              </div>
              <div className="flex justify-end pt-2">
                {confirmVaciar ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      ¿Borrar {completadas.length}?
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleVaciar}
                      disabled={pending}
                    >
                      {pending ? 'Borrando...' : 'Sí, borrar'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmVaciar(false)}
                      disabled={pending}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmVaciar(true)}
                  >
                    Vaciar completados
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
