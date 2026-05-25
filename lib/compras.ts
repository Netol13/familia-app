import type { CategoriaCompra, Compra } from './types'

export const CATEGORIA_LABEL: Record<CategoriaCompra, string> = {
  almacen: 'Almacén',
  verduleria: 'Verdulería',
  carniceria: 'Carnicería',
  farmacia: 'Farmacia',
  limpieza: 'Limpieza',
  otro: 'Otros',
}

export const CATEGORIA_EMOJI: Record<CategoriaCompra, string> = {
  almacen: '🛒',
  verduleria: '🥬',
  carniceria: '🥩',
  farmacia: '💊',
  limpieza: '🧽',
  otro: '📦',
}

// Orden visual de las secciones en la lista
export const CATEGORIA_ORDEN: CategoriaCompra[] = [
  'verduleria',
  'carniceria',
  'almacen',
  'farmacia',
  'limpieza',
  'otro',
]

export function agruparPorCategoria(
  compras: Compra[]
): Array<{ categoria: CategoriaCompra; items: Compra[] }> {
  const buckets = new Map<CategoriaCompra, Compra[]>()
  for (const c of compras) {
    const cat = (CATEGORIA_LABEL[c.categoria] ? c.categoria : 'otro') as CategoriaCompra
    if (!buckets.has(cat)) buckets.set(cat, [])
    buckets.get(cat)!.push(c)
  }
  return CATEGORIA_ORDEN.filter((cat) => buckets.has(cat)).map((categoria) => ({
    categoria,
    items: buckets.get(categoria)!,
  }))
}
