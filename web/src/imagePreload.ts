// Warm the browser HTTP cache for every image the user will reveal by scrolling,
// so they paint instantly instead of being fetched on scroll.
//
// This module is imported by main.tsx and preloadScrollImages() is called at
// module-evaluation time — i.e. the moment the page boots, while the language
// gate is still on screen. That lets the image downloads overlap with the 3D
// model / HDR decoding, so by the time the user scrolls down everything is cached.
//
// Only "scroll-revealed" images are preloaded here. Click-to-open assets
// (certificate originals, PROJECT NOVA gallery, resume evidence is small so we
// include it) stay lazy: they are not part of the scroll experience and would
// only waste bandwidth competing with the 3D model.

import { SECTION_COVERS } from './data/works'
import { CERTIFICATES } from './data/certificates'

const base = import.meta.env.BASE_URL

// Images the visitor sees simply by scrolling the page.
const SCROLL_IMAGES: string[] = [
  // Works horizontal gallery covers (one per section card)
  ...Object.values(SECTION_COVERS),
  // Certificates carousel thumbnails
  ...CERTIFICATES.map((c) => c.thumbnail),
  // Resume evidence image — small (352KB), click-to-open, warmed so first open is instant
  `${base}images/english-competition-image-two.png`,
  // Scrapbook CSS surfaces (paper texture + polaroid frame)
  `${base}scrapbook/paper-texture-seamless.webp`,
  `${base}scrapbook/polaroid-frame-1.webp`,
]

let started = false

export function preloadScrollImages(): void {
  if (started || typeof window === 'undefined') return
  started = true

  for (const src of SCROLL_IMAGES) {
    const img = new Image()
    img.decoding = 'async'
    // Low priority: let the 3D model (meshopt) and HDR keep first bandwidth.
    // The set is tiny (~730KB) so it still finishes within a second or two.
    img.setAttribute('fetchpriority', 'low')
    img.src = src
  }
}
