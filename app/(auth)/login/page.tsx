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
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl leading-none">🏡</div>
          <h1 className="text-4xl font-medium">Familia</h1>
          <p className="text-sm text-muted-foreground italic">
            Ingresá con tu email para acceder
          </p>
        </div>

        {status === 'sent' ? (
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-center space-y-2 shadow-sm">
            <p className="text-2xl">📬</p>
            <p className="font-medium">Revisá tu email</p>
            <p className="text-sm text-muted-foreground">
              Te mandamos un link para entrar a <strong>{email}</strong>. Abrilo desde el mismo dispositivo.
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
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando...' : 'Enviar link mágico'}
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}
