-- Familia App — Fase 8: Lista de compras compartida con Realtime
create table if not exists public.lista_compras (
  id uuid primary key default gen_random_uuid(),
  item text not null,
  categoria text not null default 'otro',
  cantidad text,
  notas text,
  completado boolean not null default false,
  created_by uuid references public.family_members on delete set null,
  completado_por uuid references public.family_members on delete set null,
  completado_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists lista_compras_completado_idx on public.lista_compras (completado);
create index if not exists lista_compras_categoria_idx  on public.lista_compras (categoria);
create index if not exists lista_compras_created_by_idx on public.lista_compras (created_by);

alter table public.lista_compras enable row level security;

create policy "family members full access lista_compras"
  on public.lista_compras for all
  using (public.is_family_member())
  with check (public.is_family_member());

create trigger lista_compras_updated_at before update on public.lista_compras
  for each row execute function public.set_updated_at();

alter table public.lista_compras replica identity full;

alter publication supabase_realtime add table public.lista_compras;
