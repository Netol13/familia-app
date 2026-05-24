'use client'

import { useMemo, useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentoFormDialog } from './DocumentoFormDialog'
import {
  deleteDocumento,
  getDocumentoSignedUrl,
} from '../actions'
import type {
  Documento,
  FamilyMemberLite,
  MascotaLite,
  TipoDocumento,
} from '@/lib/types'

const LABEL_TIPO: Record<TipoDocumento, string> = {
  factura: 'Factura',
  garantia: 'Garantía',
  receta: 'Receta',
  contrato: 'Contrato',
  manual: 'Manual',
  seguro: 'Seguro',
  otro: 'Otro',
}

function iconoPorMime(mime: string): string {
  if (mime === 'application/pdf') return '📕'
  if (mime.startsWith('image/')) return '🖼️'
  if (mime.includes('spreadsheet') || mime.includes('excel')) return '📊'
  if (mime.includes('word') || mime.includes('msword')) return '📝'
  return '📄'
}

function formatFecha(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function diasHasta(iso: string): number {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  return Math.round((target.getTime() - hoy.getTime()) / 86400000)
}

export function DocumentoCard({
  documento,
  members,
  mascotas,
}: {
  documento: Documento
  members: FamilyMemberLite[]
  mascotas: MascotaLite[]
}) {
  const [pending, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [opening, setOpening] = useState<'ver' | 'descargar' | null>(null)
  const [opError, setOpError] = useState<string | null>(null)

  const persona = useMemo(
    () =>
      documento.persona_id
        ? members.find((m) => m.id === documento.persona_id) ?? null
        : null,
    [documento.persona_id, members]
  )
  const mascota = useMemo(
    () =>
      documento.mascota_id
        ? mascotas.find((m) => m.id === documento.mascota_id) ?? null
        : null,
    [documento.mascota_id, mascotas]
  )

  const venceInfo = useMemo(() => {
    if (!documento.vencimiento) return null
    const dias = diasHasta(documento.vencimiento)
    if (dias < 0) return { tone: 'vencido' as const, dias }
    if (dias <= 14) return { tone: 'pronto' as const, dias }
    return { tone: 'futuro' as const, dias }
  }, [documento.vencimiento])

  async function abrir(mode: 'ver' | 'descargar') {
    setOpError(null)
    setOpening(mode)
    try {
      const url = await getDocumentoSignedUrl(documento.storage_path, {
        download: mode === 'descargar',
      })
      if (mode === 'descargar') {
        // Forzamos descarga creando un link efímero
        const a = document.createElement('a')
        a.href = url
        a.rel = 'noopener'
        a.download = documento.nombre
        document.body.appendChild(a)
        a.click()
        a.remove()
      } else {
        window.open(url, '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      setOpError(e instanceof Error ? e.message : 'No se pudo abrir el documento')
    } finally {
      setOpening(null)
    }
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteDocumento(documento.id)
      } catch (e) {
        setOpError(e instanceof Error ? e.message : 'Error al borrar')
        setConfirmDelete(false)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {venceInfo && (
          <div
            className={`text-xs px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 ${
              venceInfo.tone === 'vencido'
                ? 'bg-destructive/15 text-destructive'
                : venceInfo.tone === 'pronto'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {venceInfo.tone === 'vencido'
              ? `Vencido hace ${Math.abs(venceInfo.dias)} día${Math.abs(venceInfo.dias) === 1 ? '' : 's'}`
              : venceInfo.tone === 'pronto'
                ? `Vence en ${venceInfo.dias} día${venceInfo.dias === 1 ? '' : 's'}`
                : `Vence ${formatFecha(documento.vencimiento)}`}
          </div>
        )}

        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none shrink-0">
            {iconoPorMime(documento.mime_type)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg leading-tight">
              {documento.nombre}
            </h3>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mt-0.5">
              {LABEL_TIPO[documento.tipo]} · {formatTamano(documento.size_bytes)}
            </p>
          </div>
          <DocumentoFormDialog
            documento={documento}
            members={members}
            mascotas={mascotas}
            trigger={
              <Button variant="ghost" size="sm" className="shrink-0">
                ✏️
              </Button>
            }
          />
        </div>

        {documento.descripcion && (
          <p className="text-sm whitespace-pre-wrap">{documento.descripcion}</p>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {documento.fecha_documento && (
            <span>📅 {formatFecha(documento.fecha_documento)}</span>
          )}
          {persona && <span>👤 {persona.nombre}</span>}
          {mascota && <span>🐾 {mascota.nombre}</span>}
        </div>

        {opError && <p className="text-xs text-destructive">{opError}</p>}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            onClick={() => abrir('ver')}
            disabled={opening !== null}
          >
            {opening === 'ver' ? '...' : '👁 Ver'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => abrir('descargar')}
            disabled={opening !== null}
          >
            {opening === 'descargar' ? '...' : '⬇ Descargar'}
          </Button>
          {confirmDelete ? (
            <div className="flex gap-2 ml-auto">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
              >
                {pending ? '...' : 'Confirmar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                disabled={pending}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              🗑
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
