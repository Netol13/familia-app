import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AudioIntentRequest, IntentResult } from '@/lib/audio-intent'

export const maxDuration = 15

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent'

function buildSystemPrompt(req: AudioIntentRequest): string {
  const mascotasStr =
    req.mascotas.length > 0
      ? req.mascotas.map((m) => m.nombre).join(', ')
      : 'ninguna registrada'
  const personasStr =
    req.personas.length > 0
      ? req.personas.map((p) => p.nombre).join(', ')
      : 'ninguna registrada'

  return `Sos un asistente para una app familiar argentina. Tu única tarea es interpretar notas de voz en español rioplatense y extraer datos estructurados en JSON.

Hoy es ${req.fechaHoy}. Cuando el usuario diga "el jueves", "la semana que viene", "mañana", "el veinte de agosto", resolvé esa fecha como YYYY-MM-DD basándote en hoy. Los números escritos en letras también contan: "veinte" = 20, "agosto" = 08, etc.

Mascotas de la familia: ${mascotasStr}
Personas de la familia: ${personasStr}

Cuando el usuario mencione un nombre, matchealo con esas listas (ignorá mayúsculas, acentos, apodos razonables).

CATEGORÍAS Y CAMPOS:
- compras: artículos de supermercado. Campos: item (OBLIGATORIO), cantidad, categoria (almacen|verduleria|carniceria|farmacia|limpieza|otro), notas.
- servicios: contactos del hogar (plomero, electricista, médico, etc). Campos: nombre (OBLIGATORIO), rubro, telefono, notas.
- medicacion: remedios de un familiar. Campos: persona (OBLIGATORIO), nombre_medicamento (OBLIGATORIO), dosis, frecuencia, horario (array ["HH:MM"]), notas.
- eventos: cualquier fecha importante — cumpleaños, turnos médicos, vencimientos, recordatorios. Campos: titulo (OBLIGATORIO), fecha (OBLIGATORIO YYYY-MM-DD), tipo (cumple|vencimiento|turno|otro), descripcion, recurrente_anual (true solo si es cumpleaños), anio_nacimiento (número entero, calculalo como año_actual - edad_que_cumple).
- mascota_evento: salud o cuidado de una mascota. Campos: nombre_mascota (OBLIGATORIO), tipo (vacuna|control|antiparasitario|peso|baño|otro), fecha (YYYY-MM-DD), detalle, proxima_fecha.
- desconocido: solo si realmente no podés determinar la categoría.

EJEMPLOS:

Input: "agrega dos litros de leche"
{"intent":{"category":"compras","item":"leche","cantidad":"2 litros","categoria":"almacen"},"confidence":0.95,"summary":"Agregar 2 litros de leche a Compras","transcript":"agrega dos litros de leche"}

Input: "cumpleaños de Carlos, cumple cuarenta y uno el veinte de agosto"
{"intent":{"category":"eventos","titulo":"Cumpleaños de Carlos","fecha":"${req.fechaHoy.slice(0,4)}-08-20","tipo":"cumple","recurrente_anual":true,"anio_nacimiento":${parseInt(req.fechaHoy.slice(0,4)) - 41}},"confidence":0.95,"summary":"Cumpleaños de Carlos el 20 de agosto","transcript":"cumpleaños de Carlos, cumple cuarenta y uno el veinte de agosto"}

Input: "turno con el pediatra el viernes a las diez"
{"intent":{"category":"eventos","titulo":"Turno pediatra","fecha":"YYYY-MM-DD","tipo":"turno","descripcion":"10:00 hs"},"confidence":0.9,"summary":"Turno con el pediatra","transcript":"turno con el pediatra el viernes a las diez"}

Input: "ibuprofeno cuatrocientos para Marcelo dos veces al día"
{"intent":{"category":"medicacion","persona":"Marcelo","nombre_medicamento":"Ibuprofeno","dosis":"400mg","frecuencia":"2 veces al día"},"confidence":0.9,"summary":"Ibuprofeno 400mg para Marcelo, 2 veces al día","transcript":"ibuprofeno cuatrocientos para Marcelo dos veces al día"}

Respondé SOLO con JSON válido, sin markdown, sin texto extra.`
}

function fallback(transcript: string): IntentResult {
  return {
    intent: { category: 'desconocido', mensaje: 'No se pudo interpretar la nota.' },
    confidence: 0,
    summary: 'No se pudo determinar qué guardar',
    transcript,
  }
}

async function extractIntent(body: AudioIntentRequest): Promise<IntentResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('[audio-intent] GEMINI_API_KEY no configurada')
    return fallback(body.transcript)
  }

  let raw = ''
  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildSystemPrompt(body) + '\n\n---\n\nTexto a clasificar: ' + body.transcript }],
          },
        ],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[audio-intent] Gemini HTTP error:', res.status, err)
      return fallback(body.transcript)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    console.log('[audio-intent] Gemini raw:', raw)
  } catch (e) {
    console.error('[audio-intent] Gemini call failed:', e)
    return fallback(body.transcript)
  }

  const match = raw.match(/\{[\s\S]*\}/)
  const cleaned = match ? match[0] : raw.trim()

  try {
    return JSON.parse(cleaned) as IntentResult
  } catch (e) {
    console.error('[audio-intent] JSON parse error:', e, 'raw:', raw)
    return fallback(body.transcript)
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
  } catch (e) {
    console.error('[audio-intent] extractIntent error:', e)
    return NextResponse.json({ error: 'Error al procesar la nota' }, { status: 500 })
  }
}
