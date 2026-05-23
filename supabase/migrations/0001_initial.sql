-- Familia App — Schema inicial
-- Aplicar en Supabase SQL Editor (o vía CLI)

-- =========================================================================
-- Tabla: family_members
-- Cada usuario de auth.users debe tener un registro acá para acceder a datos
-- =========================================================================
create table if not exists public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade unique not null,
  nombre text not null,
  created_at timestamptz default now()
);

-- Trigger: cuando se crea un nuevo auth.user, crear family_member automáticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- Tabla: servicios
-- =========================================================================
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rubro text not null,
  telefono text,
  whatsapp text,
  direccion text,
  notas text,
  ultimo_contacto date,
  created_by uuid references public.family_members on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- Tabla: medicamentos
-- =========================================================================
create table if not exists public.medicamentos (
  id uuid primary key default gen_random_uuid(),
  persona text not null,
  nombre_medicamento text not null,
  dosis text,
  frecuencia text,
  horario text[],
  recetado_por text,
  notas text,
  activo boolean default true,
  created_by uuid references public.family_members on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- Tabla: mascotas
-- =========================================================================
create table if not exists public.mascotas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especie text,
  raza text,
  fecha_nacimiento date,
  veterinario_nombre text,
  veterinario_telefono text,
  alimento text,
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- Tabla: mascota_eventos (vacunas, controles, peso, antiparasitario)
-- =========================================================================
create table if not exists public.mascota_eventos (
  id uuid primary key default gen_random_uuid(),
  mascota_id uuid references public.mascotas on delete cascade not null,
  tipo text not null,
  fecha date not null,
  detalle text,
  proxima_fecha date,
  created_at timestamptz default now()
);

-- =========================================================================
-- Función helper: ¿el usuario actual es family member?
-- =========================================================================
create or replace function public.is_family_member()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.family_members
    where user_id = auth.uid()
  );
$$;

-- =========================================================================
-- Row Level Security: solo family members ven y modifican datos
-- =========================================================================
alter table public.family_members enable row level security;
alter table public.servicios enable row level security;
alter table public.medicamentos enable row level security;
alter table public.mascotas enable row level security;
alter table public.mascota_eventos enable row level security;

-- family_members: cada uno ve a todos los miembros (para "creado por X")
create policy "family members can read all members"
  on public.family_members for select
  using (public.is_family_member());

create policy "family members can update their own row"
  on public.family_members for update
  using (user_id = auth.uid());

-- servicios: family members hacen todo
create policy "family members full access servicios"
  on public.servicios for all
  using (public.is_family_member())
  with check (public.is_family_member());

-- medicamentos: family members hacen todo
create policy "family members full access medicamentos"
  on public.medicamentos for all
  using (public.is_family_member())
  with check (public.is_family_member());

-- mascotas: family members hacen todo
create policy "family members full access mascotas"
  on public.mascotas for all
  using (public.is_family_member())
  with check (public.is_family_member());

-- mascota_eventos: family members hacen todo
create policy "family members full access mascota_eventos"
  on public.mascota_eventos for all
  using (public.is_family_member())
  with check (public.is_family_member());

-- =========================================================================
-- Trigger genérico para updated_at
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger servicios_updated_at before update on public.servicios
  for each row execute function public.set_updated_at();
create trigger medicamentos_updated_at before update on public.medicamentos
  for each row execute function public.set_updated_at();
create trigger mascotas_updated_at before update on public.mascotas
  for each row execute function public.set_updated_at();
