import { createRoot } from 'react-dom/client'
import App from './App'
import { HERO_BACKGROUND_URL } from './performanceAssets'
import './styles.css'

// Public assets referenced by CSS must include Vite's runtime base path. Root-absolute
// `/scrapbook/...` URLs break when the site is hosted below a GitHub Pages subpath.
const scrapbookBase = new URL('scrapbook/', document.baseURI).href
document.documentElement.style.setProperty('--scrapbook-hero-image', `url("${HERO_BACKGROUND_URL}")`)
document.documentElement.style.setProperty('--scrapbook-paper-image', `url("${scrapbookBase}paper-texture-seamless.webp")`)
document.documentElement.style.setProperty('--scrapbook-polaroid-image', `url("${scrapbookBase}polaroid-frame-1.webp")`)

createRoot(document.getElementById('root')!).render(<App />)
