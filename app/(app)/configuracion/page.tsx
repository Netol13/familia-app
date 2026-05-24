import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
    <div className="p-6 space-y-6 max-w-md mx-auto">
      <header className="space-y-1">
        <h1 className="text-3xl font-medium">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Tu cuenta y la sesión en este dispositivo
        </p>
      </header>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-5 space-y-4">
          <h2 className="text-lg font-medium">Mi perfil</h2>
          <PerfilForm nombreActual={nombreActual} email={email} />
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-5 space-y-3">
          <h2 className="text-lg font-medium">Sesión</h2>
          <p className="text-sm text-muted-foreground">
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
