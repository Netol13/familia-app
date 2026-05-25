import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AudioIntentRequest, IntentResult } from '@/lib/audio-intent'

export const maxDuration = 15

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

function buildSystemPrompt(req: AudioIntentRequest): string {
  const mascotasStr =
    req.mascotas.length > 0
      ? req.mascotas.map((m) => m.nombre).join(', ')
      : 'ninguna registrada'
  const personasStr =
    req.personas.length > 0
      ? req.personas.map((p) => p.nombre).join(', ')
      : 'ninguna registrada'

  return `Sos un asistente para una app familiar argentina. Tu única tarea es interpretar notas de voz en español rioplatense y extraer datos estructurados.

Hoy es ${req.fechaHoy}. Cuando el usuario diga "el jueves", "la semana que viene", "mañana", resolvé esa fecha como YYYY-MM-DD basándote en hoy.

Mascotas de la familia: ${mascotasStr}
Personas de la familia: ${personasStr}

Cuando el usuario mencione un nombre de mascota o persona, matchealo con la lista (ignorá mayúsculas, acentos, apodos razonables).

Categorías disponibles y sus campos:
- compras: artículos de la lista del supermercado. Campos: item (OBLIGATORIO), cantidad (texto libre, ej: "2 litros", "3 unidades"), categoria (almacen|verduleria|carniceria|farmacia|limpieza|otro), notas.
- servicios: contactos del hogar como plomero, electricista, médico, etc. Campos: nombre (OBLIGATORIO), rubro (texto libre, ej: "plomero", "electricista"), telefono, notas.
- medicacion: medicamentos de un integrante de la familia. Campos: persona (OBLIGATORIO, nombre del familiar), nombre_medicamento (OBLIGATORIO), dosis (ej: "400mg"), frecuencia (ej: "cada 8 horas"), horario (array de strings "HH:MM", ej: ["08:00","20:00"]), notas.
- eventos: fechas importantes en el calendario familiar. Campos: titulo (OBLIGATORIO), fecha (OBLIGATORIO, YYYY-MM-DD), tipo (cumple|vencimiento|turno|otro), descripcion (incluí hora si la mencionan, ej: "10:00 hs"), recurrente_anual (true solo para cumpleaños), anio_nacimiento (número, solo si mencionan la edad o el año de nacimiento).
- mascota_evento: eventos de salud o cuidado de una mascota. Campos: nombre_mascota (OBLIGATORIO), tipo (vacuna|control|antiparasitario|peso|baño|otro), fecha (YYYY-MM-DD, usá hoy si no la mencionan), detalle, proxima_fecha (YYYY-MM-DD, solo si la mencionan).
- desconocido: si no podés determinar la categoría. Campo: mensaje (explicá en español qué entendiste).

Respondé SOLO con JSON válido, sin markdown, sin explicaciones. Formato exacto:
{"intent":{"category":"...","...campos..."},"confidence":0.0,"summary":"Descripción breve en español de lo que se va a guardar","transcript":"el texto transcripto"}`
}

async function extractIntent(body: AudioIntentRequest): Promise<IntentResult> {
  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: buildSystemPrompt(body),
    generationConfig: { maxOutputTokens: 512 },
  })

  const response = await model.generateContent(body.transcript)
  const raw = response.response.text()
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()

  try {
    return JSON.parse(cleaned) as IntentResult
  } catch {
    return {
      intent: { category: 'desconocido', mensaje: 'No se pudo interpretar la nota.' },
      confidence: 0,
      summary: 'No se pudo determinar qué guardar',
      transcript: body.transcript,
    }
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: AudioIntentRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (!body.transcript || body.transcript.trim().length < 3) {
    return NextResponse.json({ error: 'Transcript vacío' }, { status: 400 })
  }

  try {
    const result = await extractIntent(body)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Error al procesar la nota' }, { status: 500 })
  }
}
