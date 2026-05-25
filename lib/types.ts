export type Servicio = {
  id: string
  nombre: string
  rubro: string
  telefono: string | null
  whatsapp: string | null
  direccion: string | null
  notas: string | null
  ultimo_contacto: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ServicioInput = {
  nombre: string
  rubro: string
  telefono?: string | null
  whatsapp?: string | null
  direccion?: string | null
  notas?: string | null
  ultimo_contacto?: string | null
}

export type Medicamento = {
  id: string
  persona: string
  nombre_medicamento: string
  dosis: string | null
  frecuencia: string | null
  horario: string[] | null
  recetado_por: string | null
  notas: string | null
  activo: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Mascota = {
  id: string
  nombre: string
  especie: string | null
  raza: string | null
  fecha_nacimiento: string | null
  veterinario_nombre: string | null
  veterinario_telefono: string | null
  alimento: string | null
  notas: string | null
  created_at: string
  updated_at: string
}

export type MascotaEvento = {
  id: string
  mascota_id: string
  tipo: string
  fecha: string
  detalle: string | null
  proxima_fecha: string | null
  created_at: string
}

export const TIPOS_DOCUMENTO = [
  'factura',
  'garantia',
  'receta',
  'contrato',
  'manual',
  'seguro',
  'otro',
] as const

export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number]

export type Documento = {
  id: string
  nombre: string
  descripcion: string | null
  tipo: TipoDocumento
  persona_id: string | null
  mascota_id: string | null
  storage_path: string
  mime_type: string
  size_bytes: number
  fecha_documento: string | null
  vencimiento: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type DocumentoMetadataInput = {
  nombre: string
  descripcion?: string | null
  tipo: TipoDocumento
  persona_id?: string | null
  mascota_id?: string | null
  fecha_documento?: string | null
  vencimiento?: string | null
}

export type FamilyMemberLite = {
  id: string
  nombre: string
}

export type MascotaLite = {
  id: string
  nombre: string
}

export const TIPOS_EVENTO = ['cumple', 'vencimiento', 'turno', 'otro'] as const

export type TipoEvento = (typeof TIPOS_EVENTO)[number]

export type Evento = {
  id: string
  titulo: string
  descripcion: string | null
  fecha: string
  tipo: TipoEvento
  persona_id: string | null
  mascota_id: string | null
  recurrente_anual: boolean
  completado: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type OrigenEvento = 'custom' | 'documento' | 'mascota'

export type TipoUnificado = TipoEvento | 'doc-vence' | 'mascota-proxima'

export type EventoUnificado = {
  id: string
  origen: OrigenEvento
  origen_id: string
  fecha: string
  titulo: string
  subtitulo: string | null
  tipo: TipoUnificado
  completado: boolean
  href: string
  recurrente_anual: boolean
}

export const CATEGORIAS_COMPRAS = [
  'almacen',
  'verduleria',
  'carniceria',
  'farmacia',
  'limpieza',
  'otro',
] as const

export type CategoriaCompra = (typeof CATEGORIAS_COMPRAS)[number]

export type Compra = {
  id: string
  item: string
  categoria: CategoriaCompra
  cantidad: string | null
  notas: string | null
  completado: boolean
  created_by: string | null
  completado_por: string | null
  completado_at: string | null
  created_at: string
  updated_at: string
}

// Slices ligeros para feeder del calendario (lo que pasa la page al unificador)
export type DocumentoCalendarioLite = {
  id: string
  nombre: string
  tipo: string
  vencimiento: string
  persona_id: string | null
  mascota_id: string | null
}

export type MascotaEventoLite = {
  id: string
  mascota_id: string
  tipo: string
  fecha: string
  detalle: string | null
  proxima_fecha: string
}
