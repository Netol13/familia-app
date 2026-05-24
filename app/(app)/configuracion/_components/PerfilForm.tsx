'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateMiNombre } from '../actions'

export function PerfilForm({
  nombreActual,
  email,
}: {
  nombreActual: string
  email: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)
  const [nombre, setNombre] = useState(nombreActual)

  function handleSubmit(formData: FormData) {
    setError(null)
    setOkMsg(null)
    startTransition(async () => {
      try {
        await updateMiNombre(formData)
        setOkMsg('Nombre actualizado')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error al guardar')
      }
    })
  }

  const cambio = nombre.trim() !== nombreActual.trim()

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          maxLength={60}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Cómo querés que te llamen"
          autoCapitalize="words"
        />
        <p className="text-xs text-muted-foreground">
          Es el nombre que aparece en el saludo de la home.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          disabled
          readOnly
        />
        <p className="text-xs text-muted-foreground">
          El email es con el que entrás. No se puede cambiar desde acá.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {okMsg && <p className="text-sm text-primary">{okMsg}</p>}

      <Button type="submit" disabled={pending || !cambio}>
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </form>
  )
}
