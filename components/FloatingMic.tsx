'use client'

import { useState, useRef, useCallback } from 'react'
import { Mic, MicOff, Loader2, X } from 'lucide-react'
import { useVoiceContext } from '@/components/VoiceContext'
import { IntentConfirmDialog } from '@/components/IntentConfirmDialog'
import { Button } from '@/components/ui/button'
import type { IntentResult } from '@/lib/audio-intent'

type MicState = 'idle' | 'recording' | 'processing'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any

function createRecognition(): AnyRecognition | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition
  if (!Ctor) return null
  const r = new Ctor()
  r.lang = 'es-AR'
  r.continuous = true
  r.interimResults = true
  r.maxAlternatives = 1
  return r
}

export function FloatingMic() {
  const { mascotas, personas } = useVoiceContext()
  const [state, setState] = useState<MicState>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<AnyRecognition | null>(null)
  const finalTranscriptRef = useRef('')
  const isRecordingRef = useRef(false)

  const isSupported =
    typeof window !== 'undefined' &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ('SpeechRecognition' in (window as any) || 'webkitSpeechRecognition' in (window as any))

  const stopAndProcess = useCallback(async () => {
    isRecordingRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null

    const finalText = finalTranscriptRef.current.trim()
    if (!finalText) {
      setError('No se capturó texto. Hablá más cerca del micrófono.')
      setState('idle')
      return
    }

    setState('processing')
    try {
      const res = await fetch('/api/audio-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: finalText,
          mascotas,
          personas,
          fechaHoy: new Date().toISOString().slice(0, 10),
        }),
      })
      if (!res.ok) throw new Error('Error del servidor')
      const result: IntentResult = await res.json()
      setIntentResult(result)
    } catch {
      setError('No se pudo procesar la nota. Intentá de nuevo.')
    } finally {
      setState('idle')
    }
  }, [mascotas, personas])

  function startRecording() {
    if (!isSupported) {
      setError('Tu navegador no soporta grabación por voz. Usá Safari en iOS o Chrome.')
      return
    }

    finalTranscriptRef.current = ''
    setTranscript('')
    setInterimTranscript('')
    setError(null)

    const r = createRecognition()
    if (!r) return
    recognitionRef.current = r
    isRecordingRef.current = true

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      setTranscript(finalTranscriptRef.current.trim())
      setInterimTranscript(interim)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onerror = (event: any) => {
      isRecordingRef.current = false
      if (event.error === 'not-allowed') {
        setError('Permiso de micrófono denegado. Activalo en Ajustes > Safari > Micrófono.')
      } else if (event.error !== 'no-speech') {
        setError('Error al grabar. Intentá de nuevo.')
      }
      setState('idle')
    }

    // iOS Safari corta por silencio — reanudar si seguimos en modo grabación
    r.onend = () => {
      if (isRecordingRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch {}
      }
    }

    setState('recording')
    r.start()
  }

  function cancelRecording() {
    isRecordingRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setState('idle')
    setTranscript('')
    setInterimTranscript('')
  }

  function handleMicPress() {
    if (state === 'idle') startRecording()
    else if (state === 'recording') stopAndProcess()
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleMicPress}
        disabled={state === 'processing'}
        aria-label={state === 'recording' ? 'Detener grabación' : 'Grabar nota de voz'}
        style={{ bottom: 'calc(68px + env(safe-area-inset-bottom) + 12px)' }}
        className={[
          'fixed right-4 z-40 size-14 rounded-full shadow-lg',
          'flex items-center justify-center transition-all',
          state === 'recording'
            ? 'bg-red-500 text-white animate-pulse'
            : state === 'processing'
              ? 'bg-muted text-muted-foreground cursor-wait'
              : 'bg-brand text-brand-foreground hover:bg-brand/90',
        ].join(' ')}
      >
        {state === 'processing' ? (
          <Loader2 className="size-6 animate-spin" />
        ) : state === 'recording' ? (
          <MicOff className="size-6" />
        ) : (
          <Mic className="size-6" />
        )}
      </button>

      {/* Panel de grabación */}
      {state === 'recording' && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 bg-background border-t border-border rounded-t-2xl p-4 shadow-xl"
          style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
        >
          <p className="text-xs text-muted-foreground mb-2 text-center">
            🎙 Grabando — tocá el micrófono para terminar
          </p>
          <p className="min-h-[3rem] text-sm text-foreground">
            {transcript}
            <span className="text-muted-foreground italic">{interimTranscript}</span>
            {!transcript && !interimTranscript && (
              <span className="text-muted-foreground">Hablá...</span>
            )}
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={cancelRecording} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={stopAndProcess} className="flex-1">
              Listo
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de confirmación */}
      {intentResult && (
        <IntentConfirmDialog
          result={intentResult}
          mascotas={mascotas}
          onClose={() => setIntentResult(null)}
        />
      )}

      {/* Toast de error */}
      {error && (
        <div
          className="fixed left-4 right-4 z-50 bg-destructive text-destructive-foreground rounded-lg p-3 text-sm shadow-lg flex items-start gap-2"
          style={{ bottom: 'calc(68px + env(safe-area-inset-bottom) + 80px)' }}
        >
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} aria-label="Cerrar error">
            <X className="size-4 shrink-0" />
          </button>
        </div>
      )}
    </>
  )
}
