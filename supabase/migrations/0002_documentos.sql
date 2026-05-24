-- Familia App — Fase 6: Documentos (PDFs, imágenes, papeles del hogar)
-- Aplicar en Supabase SQL Editor (o vía CLI: supabase db push)

-- =========================================================================
-- Tabla: documentos
-- Metadata de los archivos guardados en Storage (bucket 'documentos').
-- El archivo real vive en storage.objects; storage_path es el puente.
-- =========================================================================
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  tipo text not null,
    -- valores esperados: factura | garantia | receta | contrato | manual | seguro | otro
  persona_id uuid references public.family_members on delete set null,
  mascota_id uuid references public.mascotas on delete set null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  fecha_documento date,
  vencimiento date,
  created_by uuid references public.family_members on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices para los filtros que la UI hará seguido
create index if not exists documentos_tipo_idx on public.documentos (tipo);
create index if not exists documentos_persona_idx on public.documentos (persona_id);
create index if not exists documentos_mascota_idx on public.documentos (mascota_id);
create index if not exists documentos_vencimiento_idx on public.documentos (vencimiento)
  where vencimiento is not null;

-- =========================================================================
-- RLS: full access para family members (mismo patrón que el resto)
-- =========================================================================
alter table public.documentos enable row level security;

create policy "family members full access documentos"
  on public.documentos for all
  using (public.is_family_member())
  with check (public.is_family_member());

-- Trigger updated_at
create trigger documentos_updated_at before update on public.documentos
  for each row execute function public.set_updated_at();

-- =========================================================================
-- Storage: bucket privado 'documentos'
-- =========================================================================
insert into storage.buckets (id, name, public)
  values ('documentos', 'documentos', false)
  on conflict (id) do nothing;

-- Policies sobre storage.objects para el bucket 'documentos'.
-- Solo family members pueden leer/escribir/borrar.
create policy "family members read documentos bucket"
  on storage.objects for select
  using (bucket_id = 'documentos' and public.is_family_member());

create policy "family members upload documentos bucket"
  on storage.objects for insert
  with check (bucket_id = 'documentos' and public.is_family_member());

create policy "family members update documentos bucket"
  on storage.objects for update
  using (bucket_id = 'documentos' and public.is_family_member())
  with check (bucket_id = 'documentos' and public.is_family_member());

create policy "family members delete documentos bucket"
  on storage.objects for delete
  using (bucket_id = 'documentos' and public.is_family_member());
