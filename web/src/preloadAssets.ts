import { HERO_BACKGROUND_URL } from './performanceAssets'

// Warm the browser HTTP cache for the first-paint 3D / Hero assets the moment
// the page boots — i.e. while the Language Gate is still on screen.
//
// This module deliberately imports NOTHING from three / @react-three/* so it
// can run from the lightweight entry chunk and start downloads immediately,
// without pulling the heavy WebGL bundle into the initial payload. The real
// three loaders (GLTFLoader / RGBELoader) later request the same URLs and hit
// the warmed cache, so each asset is only transferred once.
//
// Priority (per the entrance-experience spec):
//   1) the character GLB
//   2) the HDR environment
//   3) the art-directed hero scrapbook background

const BASE = import.meta.env.BASE_URL
const MODEL_FILE = import.meta.env.VITE_MODEL_FILE || 'models/me_meshopt_balanced.glb'
const MODEL_URL = `${BASE}${MODEL_FILE}`
const ENV_URL = `${BASE}textures/env_lite.hdr`

let started = false

export function preloadCriticalAssets(): void {
  if (started || typeof window === 'undefined') return
  started = true

  // Plain GET warms the HTTP cache. We do not consume the body — the response
  // is cached by URL, and the subsequent loader request reuses it.
  const warm = (url: string) => {
    try {
      fetch(url, { credentials: 'same-origin' }).catch(() => {})
    } catch {
      /* network/preload best-effort — never block boot */
    }
  }

  warm(MODEL_URL) // first priority: character
  warm(ENV_URL) // second priority: HDR environment

  // third priority: hero scrapbook background (shares cache with the R3F shader)
  const hero = new Image()
  hero.decoding = 'async'
  hero.src = HERO_BACKGROUND_URL
}
