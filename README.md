# Familia App

PWA instalable para la familia núcleo. Servicios del hogar, medicación y mascotas en un solo lugar.

**Nota proyecto en el vault:** `d:\Obsidian\Santino\Proyectos\familia-app.md`

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL + Auth magic link)
- Vercel para hosting
- PWA con manifest iOS

## Setup local

1. Copiar `.env.local.example` a `.env.local` y completar con valores de Supabase (Project Settings → API).
2. Aplicar la migración: en Supabase SQL Editor, pegar y ejecutar `supabase/migrations/0001_initial.sql`.
3. En Supabase Auth → URL Configuration: agregar `http://localhost:3000/auth/callback` y la URL de producción.
4. Instalar deps y correr dev:

```bash
npm install
npm run dev
```

## Estructura

```
app/
├── (auth)/
│   ├── login/page.tsx          # Magic link
│   └── auth/callback/route.ts  # Handler OAuth
├── (app)/                      # Rutas autenticadas
│   ├── layout.tsx              # Bottom nav + guard
│   ├── page.tsx                # Home
│   ├── servicios/
│   ├── medicacion/
│   └── mascotas/
└── layout.tsx                  # Root + meta PWA iOS

components/
├── ui/                         # shadcn/ui
└── BottomNav.tsx

lib/supabase/
├── client.ts                   # Browser client
├── server.ts                   # Server client
└── middleware.ts               # Refresh session

middleware.ts                   # Auth gate

supabase/migrations/            # Schema versionado
```

## Roadmap

Ver `d:\Obsidian\Santino\Proyectos\familia-app.md` para el roadmap completo y log de avances.
