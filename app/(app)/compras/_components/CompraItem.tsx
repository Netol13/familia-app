'use client'

import { useState, useTransition } from 'react'
import { Pencil, Trash2, X, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toggleCompra, deleteCompra, updateCompra } from '../actions'
import { CATEGORIAS_COMPRAS, type Compra, type CategoriaCompra, type FamilyMemberLite } from '@/lib/types'
import { CATEGORIA_LABEL } from '@/lib/compras'

type Props = {
  compra: Compra
  members: FamilyMemberLite[]
}

function nombrePor(id: string | null, members: FamilyMemberLite[]): string | null {
  if (!id) return null
  return members.find((m) => m.id === id)?.nombre ?? null
}

export function CompraItem({ compra, members }: Props) {
  const [pending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [categoria, setCategoria] = useState<CategoriaCompra>(compra.categoria)

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleCompra(compra.id, !compra.completado)
      } catch {
        /* swallow — el realtime corregirá si hace falta */
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCompra(compra.id)
    })
  }

  function handleSave(formData: FormData) {
    formData.set('categoria', categoria)
    startTransition(async () => {
      try {
        await updateCompra(compra.id, formData)
        setEditing(false)
      } catch {
        /* silent */
      }
    })
  }

  const agregadoPor = nombrePor(compra.created_by, members)
  const completadoPor = nombrePor(compra.completado_por, members)

  if (editing) {
    return (
      <form
        action={handleSave}
        className="rounded-xl border border-border/60 bg-card p-3 space-y-2"
      >
        <Input
          name="item"
          required
          defaultValue={compra.item}
          autoFocus
          disabled={pending}
        />
        <div className="grid grid-cols-2 gap-2">
          <Input name="cantidad" defaultValue={compra.cantidad ?? ''} placeholder="Cantidad" disabled={pending} />
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaCompra)}
            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
            disabled={pending}
          >
            {CATEGORIAS_COMPRAS.map((c) => (
              <option key={c} value={c}>{CATEGORIA_LABEL[c]}</option>
            ))}
          </select>
        </div>
        <Input name="notas" defaultValue={compra.notas ?? ''} placeholder="Notas" disabled={pending} />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 transition-opacity ${
        compra.completado ? 'opacity-60' : ''
      }`}
    >
      <button
        type="button"
        onClick={handleToggle}
        disabled={pending}
        aria-label={compra.completado ? 'Marcar como pendiente' : 'Marcar como comprado'}
        className={`mt-0.5 size-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
          compra.completado
            ? 'bg-foreground border-foreground text-background'
            : 'border-border hover:border-foreground'
        }`}
      >
        {compra.completado && <Check className="size-3" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight ${compra.completado ? 'line-through' : ''}`}>
          {compra.item}
          {compra.cantidad && (
            <span className="text-muted-foreground ml-2">· {compra.cantidad}</span>
          )}
        </p>
        {compra.notas && (
          <p className="text-xs text-muted-foreground mt-0.5">{compra.notas}</p>
        )}
        <p className="text-[10px] text-muted-foreground/80 mt-1">
          {compra.completado && completadoPor
            ? `✓ por ${completadoPor}`
            : agregadoPor
              ? `agregado por ${agregadoPor}`
              : ''}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {confirmDelete ? (
          <>
            <Button
              type="button"
              size="icon-xs"
              variant="destructive"
              onClick={handleDelete}
              disabled={pending}
              aria-label="Confirmar borrado"
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              disabled={pending}
              aria-label="Cancelar"
            >
              <X className="size-3.5" />
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => setEditing(true)}
              disabled={pending}
              aria-label="Editar"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => setConfirmDelete(true)}
              disabled={pending}
              aria-label="Borrar"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
