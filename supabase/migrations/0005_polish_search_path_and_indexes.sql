-- Familia App — Fase 8 polish: search_path bindeado e índices FK
-- (los revokes EXECUTE fueron rollbackeados en 0007 porque rompían las RLS policies)

create or replace function public.is_family_member()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.family_members
    where user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.family_members (user_id, nombre)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists servicios_created_by_idx       on public.servicios (created_by);
create index if not exists medicamentos_created_by_idx    on public.medicamentos (created_by);
create index if not exists documentos_created_by_idx      on public.documentos (created_by);
create index if not exists eventos_created_by_idx         on public.eventos (created_by);
create index if not exists mascota_eventos_mascota_idx    on public.mascota_eventos (mascota_id);
