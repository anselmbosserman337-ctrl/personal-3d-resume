import { createRoot } from 'react-dom/client'
import App from './App'
import { HERO_BACKGROUND_URL } from './performanceAssets'
import { preloadScrollImages } from './imagePreload'
import './styles.css'

// Public assets referenced by CSS must include Vite's runtime base path. Root-absolute
// `/scrapbook/...` URLs break when the site is hosted below a GitHub Pages subpath.
const scrapbookBase = new URL('scrapbook/', document.baseURI).href
document.documentElement.style.setProperty('--scrapbook-hero-image', `url("${HERO_BACKGROUND_URL}")`)
document.documentElement.style.setProperty('--scrapbook-paper-image', `url("${scrapbookBase}paper-texture-seamless.webp")`)
document.documentElement.style.setProperty('--scrapbook-polaroid-image', `url("${scrapbookBase}polaroid-frame-1.webp")`)

// Begin warming scroll-revealed images now — overlaps with the language gate
// and 3D model load, so they are cached before the user scrolls.
preloadScrollImages()

createRoot(document.getElementById('root')!).render(<App />)
