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

// Install byte-level observers before the lazily mounted Three scene starts its
// critical requests. The observer starts no duplicate downloads and pulls no WebGL
// code into the lightweight entry path.
preloadCriticalAssets()

createRoot(document.getElementById('root')!).render(<App />)
