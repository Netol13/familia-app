export type AudioIntent =
  | { category: 'compras'; item: string; cantidad?: string; categoria?: string; notas?: string }
  | { category: 'servicios'; nombre: string; rubro?: string; telefono?: string; notas?: string }
  | { category: 'medicacion'; persona: string; nombre_medicamento: string; dosis?: string; frecuencia?: string; horario?: string[]; notas?: string }
  | { category: 'eventos'; titulo: string; fecha: string; tipo?: string; descripcion?: string; recurrente_anual?: boolean; anio_nacimiento?: number }
  | { category: 'mascota_evento'; nombre_mascota: string; tipo: string; fecha?: string; detalle?: string; proxima_fecha?: string }
  | { category: 'desconocido'; mensaje: string }

export type IntentResult = {
  intent: AudioIntent
  confidence: number
  summary: string
  transcript: string
}

export type AudioIntentRequest = {
  transcript: string
  mascotas: Array<{ id: string; nombre: string }>
  personas: Array<{ id: string; nombre: string }>
  fechaHoy: string
}
