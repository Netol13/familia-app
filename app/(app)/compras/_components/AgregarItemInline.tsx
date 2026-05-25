'use client'

import { useRef, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CATEGORIAS_COMPRAS, type CategoriaCompra } from '@/lib/types'
import { CATEGORIA_LABEL, CATEGORIA_EMOJI } from '@/lib/compras'
import { createCompra } from '../actions'

export function AgregarItemInline() {
  const [pending, startTransition] = useTransition()
  const [categoria, setCategoria] = useState<CategoriaCompra>('almacen')
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const itemRef = useRef<HTMLInputElement>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    formData.set('categoria', categoria)
    startTransition(async () => {
      try {
        await createCompra(formData)
        formRef.current?.reset()
        itemRef.current?.focus()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al agregar')
      }
    })
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl border border-border/60 bg-card p-3 space-y-2"
    >
      <div className="flex gap-2">
        <Input
          ref={itemRef}
          name="item"
          required
          placeholder="Qué falta... (leche, pan, lavandina)"
          autoCapitalize="sentences"
          className="flex-1"
          disabled={pending}
        />
        <Button type="submit" disabled={pending}>
          {pending ? '...' : '+ Agregar'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIAS_COMPRAS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategoria(c)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              categoria === c
                ? 'bg-foreground text-background border-foreground'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            <span className="mr-1">{CATEGORIA_EMOJI[c]}</span>
            {CATEGORIA_LABEL[c]}
          </button>
        ))}
      </div>

      <details className="text-xs">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-1">
          + Cantidad y notas
        </summary>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Input
            name="cantidad"
            placeholder="Cantidad (2 kg, 1 L...)"
            disabled={pending}
          />
          <Input
            name="notas"
            placeholder="Notas (marca, sin sal...)"
            disabled={pending}
          />
        </div>
      </details>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  )
}
