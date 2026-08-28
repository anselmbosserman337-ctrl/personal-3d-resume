import { createRoot } from 'react-dom/client'
import App from './App'
import { HERO_BACKGROUND_URL } from './performanceAssets'
import { preloadCriticalAssets } from './preloadAssets'
import './styles.css'

// Public assets referenced by CSS must include Vite's runtime base path. Root-absolute
// `/scrapbook/...` URLs break when the site is hosted below a GitHub Pages subpath.
const scrapbookBase = new URL('scrapbook/', document.baseURI).href
document.documentElement.style.setProperty('--scrapbook-hero-image', `url("${HERO_BACKGROUND_URL}")`)
document.documentElement.style.setProperty('--scrapbook-paper-image', `url("${scrapbookBase}paper-texture-seamless.webp")`)
document.documentElement.style.setProperty('--scrapbook-polaroid-image', `url("${scrapbookBase}polaroid-frame-1.webp")`)

// Begin warming the first-paint 3D / Hero assets the instant the page boots — while
// the Language Gate is still on screen. Uses a lightweight fetch (no WebGL bundle),
// so it never delays the gate. See web/src/preloadAssets.ts.
preloadCriticalAssets()

createRoot(document.getElementById('root')!).render(<App />)
