import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { PerfilForm } from './_components/PerfilForm'
import { signOut } from './actions'

export const dynamic = 'force-dynamic'

export default async function ConfiguracionPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('family_members')
    .select('nombre')
    .eq('user_id', user?.id ?? '')
    .single()

  const nombreActual = member?.nombre ?? ''
  const email = user?.email ?? ''

  return (
    <div className="px-5 pt-10 pb-6 space-y-7 max-w-screen-sm mx-auto w-full">
      <PageHeader
        eyebrow="Tu cuenta"
        title="Configuración"
        description="Tu perfil y la sesión en este dispositivo."
      />

      <Card className="border-border/60" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <CardContent className="p-5 space-y-4">
          <h2 className="text-xl font-heading tracking-tight">Mi perfil</h2>
          <PerfilForm nombreActual={nombreActual} email={email} />
        </CardContent>
      </Card>

      <Card className="border-border/60" style={{ boxShadow: 'var(--shadow-soft)' }}>
        <CardContent className="p-5 space-y-3">
          <h2 className="text-xl font-heading tracking-tight">Sesión</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cerrá la sesión en este dispositivo. La próxima vez vas a necesitar
            el magic link en tu email para volver a entrar.
          </p>
          <form action={signOut}>
            <Button type="submit" variant="destructive">
              Cerrar sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
