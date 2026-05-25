'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setStatus('error')
      setError(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Halo decorativo */}
      <div
        aria-hidden
        className="absolute top-0 right-0 size-[420px] rounded-full pointer-events-none -translate-y-1/3 translate-x-1/3"
        style={{ background: 'radial-gradient(closest-side, var(--brand) 0%, transparent 70%)', opacity: 0.15 }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 size-[360px] rounded-full pointer-events-none translate-y-1/3 -translate-x-1/3"
        style={{ background: 'radial-gradient(closest-side, var(--primary) 0%, transparent 70%)', opacity: 0.12 }}
      />

      <div className="relative w-full max-w-sm space-y-10">
        <div className="space-y-4">
          <div className="size-14 rounded-2xl bg-brand flex items-center justify-center text-2xl" style={{ boxShadow: 'var(--shadow-hero)' }}>
            🏡
          </div>
          <div className="space-y-2">
            <p className="eyebrow">Bienvenidos a casa</p>
            <h1 className="text-hero text-[clamp(3rem,11vw,4.5rem)]">
              Familia.
            </h1>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Lo del hogar — compras, contactos, fechas — en un solo lugar.
            </p>
          </div>
        </div>

        {status === 'sent' ? (
          <div
            className="rounded-3xl border border-border/60 bg-card p-6 text-center space-y-3"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <p className="text-3xl">📬</p>
            <p className="text-xl font-heading tracking-tight">Revisá tu email</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Te mandamos un link para entrar a <strong className="text-foreground">{email}</strong>. Abrilo desde el mismo dispositivo.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vos@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoCapitalize="none"
                className="h-12 text-base"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full h-12 text-base bg-brand text-brand-foreground hover:bg-brand/90"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Enviando...' : 'Enviar link mágico →'}
            </Button>

            <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
              Sin contraseña. Te mandamos un link por mail, lo abrís y entrás.
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
