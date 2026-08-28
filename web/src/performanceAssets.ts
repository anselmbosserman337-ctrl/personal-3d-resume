const assetUrl = (path: string) => {
  if (typeof document !== 'undefined') return new URL(path, document.baseURI).href
  return `${import.meta.env.BASE_URL}${path}`
}

function selectHeroBackground() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return assetUrl('scrapbook/hero-scrapbook-full.webp')
  }

  if (window.matchMedia('(max-width: 600px)').matches) {
    return assetUrl('scrapbook/hero-scrapbook-mobile.webp')
  }

  if (window.matchMedia('(max-width: 1024px)').matches) {
    return assetUrl('scrapbook/hero-scrapbook-tablet.webp')
  }

  return assetUrl('scrapbook/hero-scrapbook-full.webp')
}

// Pick once, before React mounts. CSS and WebGL share the same URL, so each
// viewport downloads exactly one art-directed hero image.
export const HERO_BACKGROUND_URL = selectHeroBackground()
