// Genera todos los íconos PNG a partir de scripts/icon-source.svg
// Uso: node scripts/gen-icons.mjs

import sharp from 'sharp'
import { readFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const srcPath = join(__dirname, 'icon-source.svg')
const iconsDir = join(root, 'public', 'icons')
const publicDir = join(root, 'public')

await mkdir(iconsDir, { recursive: true })
const svg = await readFile(srcPath)

// Tamaños estándar para PWA + iOS
const variants = [
  { size: 192, file: join(iconsDir, 'icon-192.png') },
  { size: 512, file: join(iconsDir, 'icon-512.png') },
  { size: 180, file: join(publicDir, 'apple-touch-icon.png') }, // iOS espera este path
  { size: 180, file: join(iconsDir, 'apple-touch-icon.png') }, // referenciado en layout
  { size: 32, file: join(publicDir, 'favicon-32.png') },
  { size: 16, file: join(publicDir, 'favicon-16.png') },
]

for (const v of variants) {
  await sharp(svg).resize(v.size, v.size).png().toFile(v.file)
  console.log(`✓ ${v.size}x${v.size} → ${v.file.replace(root, '')}`)
}

// Maskable icon: agregamos padding de ~10% (safe zone Android)
// El fondo salvia ya cubre todo, así que solo escalamos la casita hacia adentro
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#7A8F6B"/>
  <g transform="translate(256 256) scale(0.78)">
    <path d="M -160 -10 L 0 -160 L 160 -10 L 160 180 Q 160 200, 140 200 L -140 200 Q -160 200, -160 180 Z" fill="#FAF6F0"/>
    <path d="M -40 200 L -40 70 Q -40 30, 0 30 Q 40 30, 40 70 L 40 200 Z" fill="#7A8F6B"/>
    <circle cx="22" cy="125" r="5" fill="#FAF6F0"/>
  </g>
</svg>
`
await sharp(Buffer.from(maskableSvg))
  .resize(512, 512)
  .png()
  .toFile(join(iconsDir, 'icon-512-maskable.png'))
console.log(`✓ 512x512 maskable → /public/icons/icon-512-maskable.png`)

console.log('\nListo. Todos los íconos generados.')
