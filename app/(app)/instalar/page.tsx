import { Card, CardContent } from '@/components/ui/card'

const pasos = [
  {
    n: 1,
    titulo: 'Abrí Safari (no Chrome ni otro)',
    detalle:
      'Esto solo funciona desde Safari porque es lo que usa iOS para instalar apps web. Si estás leyendo esto desde Safari, ya estás.',
    icono: '🧭',
  },
  {
    n: 2,
    titulo: 'Tocá el botón "Compartir" abajo',
    detalle:
      'Es el cuadrado con la flecha hacia arriba, en la barra de abajo (al lado de la barra de direcciones).',
    icono: '⬆️',
  },
  {
    n: 3,
    titulo: 'Bajá y tocá "Agregar a pantalla de inicio"',
    detalle:
      'Te puede aparecer entre las opciones. Si no la ves, deslizá hacia abajo, está más abajo en la lista.',
    icono: '➕',
  },
  {
    n: 4,
    titulo: 'Confirmá tocando "Agregar"',
    detalle:
      'Va a aparecer un ícono nuevo en tu pantalla de inicio con el nombre "Familia". Tocalo como cualquier otra app.',
    icono: '✅',
  },
]

export default function InstalarPage() {
  return (
    <div className="p-6 space-y-6">
      <header className="space-y-2 text-center">
        <div className="text-5xl">📱</div>
        <h1 className="text-3xl font-medium">Instalar en iPhone</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Para tenerla como una app de verdad, sin la barra de Safari arriba
          y con un ícono propio en la pantalla de inicio.
        </p>
      </header>

      <div className="space-y-3">
        {pasos.map((p) => (
          <Card key={p.n} className="border-border/60 shadow-sm">
            <CardContent className="p-4 flex gap-4 items-start">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="size-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                  {p.n}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="font-medium text-base flex items-center gap-2">
                  <span>{p.icono}</span>
                  <span>{p.titulo}</span>
                </h2>
                <p className="text-sm text-muted-foreground">{p.detalle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-border/60 bg-card/40">
        <CardContent className="p-4 text-sm space-y-2">
          <p className="font-medium">💡 ¿Y si me cierro la sesión?</p>
          <p className="text-muted-foreground">
            La app recuerda tu login por varios meses, no tenés que volver a
            poner el email cada vez. Si se cierra alguna vez, abrís la app y
            volvés a pedir el link mágico al email.
          </p>
        </CardContent>
      </Card>

      <Card className="border-dashed border-border/60 bg-card/40">
        <CardContent className="p-4 text-sm space-y-2">
          <p className="font-medium">🔒 ¿Es seguro?</p>
          <p className="text-muted-foreground">
            Sí. Solo entran los emails que están en la lista de la familia.
            Aunque alguien sepa la dirección de la app, no puede entrar si su
            email no fue agregado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
