-- Familia App — Fase 7: Calendario / Recordatorios (eventos)
-- Aplicada en remoto vía MCP. Este archivo queda en el repo como histórico.

create table if not exists public.eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  fecha date not null,
  tipo text not null,
    -- cumple | vencimiento | turno | otro
  persona_id uuid references public.family_members on delete set null,
  mascota_id uuid references public.mascotas on delete set null,
  recurrente_anual boolean default false,
    -- true para cumpleaños / aniversarios (próxima ocurrencia calculada on-the-fly)
  completado boolean default false,
  created_by uuid references public.family_members on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists eventos_fecha_idx on public.eventos (fecha);
create index if not exists eventos_tipo_idx on public.eventos (tipo);
create index if not exists eventos_persona_idx on public.eventos (persona_id);
create index if not exists eventos_mascota_idx on public.eventos (mascota_id);

alter table public.eventos enable row level security;

create policy "family members full access eventos"
  on public.eventos for all
  using (public.is_family_member())
  with check (public.is_family_member());

create trigger eventos_updated_at before update on public.eventos
  for each row execute function public.set_updated_at();
