import { HERO_BACKGROUND_URL } from './performanceAssets'

export type CriticalResourceId = 'model' | 'environment' | 'hero'

type MutableResource = {
  id: CriticalResourceId
  url: string
  totalBytes: number
  loadedBytes: number
  downloadComplete: boolean
  ready: boolean
  error: boolean
}

export type CriticalResourceSnapshot = {
  progress: number
  allReady: boolean
  hasError: boolean
  startedAt: number
  resources: Record<CriticalResourceId, Readonly<MutableResource>>
}

const BASE = import.meta.env.BASE_URL
const MODEL_FILE = import.meta.env.VITE_MODEL_FILE || 'models/me_meshopt_balanced.glb'

const absoluteAssetUrl = (path: string) => {
  if (typeof document !== 'undefined') return new URL(path, document.baseURI).href
  return `${BASE}${path}`
}

const heroBytes = HERO_BACKGROUND_URL.includes('hero-scrapbook-mobile')
  ? 87_100
  : HERO_BACKGROUND_URL.includes('hero-scrapbook-tablet')
    ? 133_706
    : 196_272

const resources: Record<CriticalResourceId, MutableResource> = {
  model: {
    id: 'model',
    url: absoluteAssetUrl(MODEL_FILE),
    totalBytes: MODEL_FILE === 'models/me_meshopt_balanced.glb' ? 8_906_360 : 11_102_572,
    loadedBytes: 0,
    downloadComplete: false,
    ready: false,
    error: false,
  },
  environment: {
    id: 'environment',
    url: absoluteAssetUrl('textures/env_lite.hdr'),
    totalBytes: 1_126_585,
    loadedBytes: 0,
    downloadComplete: false,
    ready: false,
    error: false,
  },
  hero: {
    id: 'hero',
    url: HERO_BACKGROUND_URL,
    totalBytes: heroBytes,
    loadedBytes: 0,
    downloadComplete: false,
    ready: false,
    error: false,
  },
}

const listeners = new Set<() => void>()
let started = false
let startedAt = 0
let highestProgress = 0
let notifyFrame: number | null = null

function createSnapshot(): CriticalResourceSnapshot {
  const values = Object.values(resources)
  const totalBytes = values.reduce((sum, resource) => sum + resource.totalBytes, 0)
  const allReady = values.every((resource) => resource.ready)
  const hasError = values.some((resource) => resource.error && !resource.ready)

  // Downloaded bytes make up 94% of each file's contribution. The final 6%
  // is awarded only when that resource is decoded and usable by the scene.
  const completedWeight = values.reduce((sum, resource) => {
    if (resource.ready) return sum + resource.totalBytes
    const downloaded = Math.min(resource.loadedBytes, resource.totalBytes)
    return sum + downloaded * 0.94
  }, 0)
  const measuredProgress = allReady ? 100 : Math.min(99, (completedWeight / totalBytes) * 100)
  highestProgress = Math.max(highestProgress, measuredProgress)

  return {
    progress: allReady ? 100 : highestProgress,
    allReady,
    hasError,
    startedAt,
    resources: {
      model: { ...resources.model },
      environment: { ...resources.environment },
      hero: { ...resources.hero },
    },
  }
}

let snapshot = createSnapshot()

function publish() {
  snapshot = createSnapshot()
  if (notifyFrame !== null || typeof window === 'undefined') {
    if (typeof window === 'undefined') listeners.forEach((listener) => listener())
    return
  }
  notifyFrame = window.requestAnimationFrame(() => {
    notifyFrame = null
    listeners.forEach((listener) => listener())
  })
}

function resourceForUrl(url: string) {
  const absolute = new URL(url, document.baseURI).href
  return Object.values(resources).find((resource) => resource.url === absolute)
}

async function observeResponse(response: Response, resource: MutableResource) {
  try {
    if (!response.body) {
      const buffer = await response.arrayBuffer()
      resource.loadedBytes = Math.max(resource.loadedBytes, Math.min(buffer.byteLength, resource.totalBytes))
    } else {
      const reader = response.body.getReader()
      let loaded = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        loaded += value.byteLength
        resource.loadedBytes = Math.max(resource.loadedBytes, Math.min(loaded, resource.totalBytes))
        publish()
      }
    }
    resource.loadedBytes = resource.totalBytes
    resource.downloadComplete = true
    publish()
  } catch (error) {
    markCriticalResourceError(resource.id, error)
  }
}

function installCriticalFetchObserver() {
  const nativeFetch = window.fetch.bind(window)
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestUrl =
      typeof input === 'string' || input instanceof URL ? String(input) : input.url
    const resource = resourceForUrl(requestUrl)
    try {
      const response = await nativeFetch(input, init)
      if (resource) {
        if (!response.ok) {
          markCriticalResourceError(resource.id, new Error(`HTTP ${response.status}`))
        } else {
          // Tee the loader's real response. This observes its bytes without
          // starting a second request or changing the response consumed by Three.
          void observeResponse(response.clone(), resource)
        }
      }
      return response
    } catch (error) {
      if (resource) markCriticalResourceError(resource.id, error)
      throw error
    }
  }
}

function installHeroTimingObserver() {
  if (!('PerformanceObserver' in window)) return
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (new URL(entry.name, document.baseURI).href !== resources.hero.url) continue
      resources.hero.loadedBytes = resources.hero.totalBytes
      resources.hero.downloadComplete = true
      publish()
      observer.disconnect()
      break
    }
  })
  observer.observe({ type: 'resource', buffered: true })
}

export function preloadCriticalAssets() {
  if (started || typeof window === 'undefined') return
  started = true
  startedAt = window.performance.now()
  snapshot = createSnapshot()

  // Observe the actual Three loader responses rather than issuing duplicate
  // prefetch requests. SceneStage starts immediately behind the HTML gate.
  installCriticalFetchObserver()
  installHeroTimingObserver()
}

export function markCriticalResourceReady(id: CriticalResourceId) {
  const resource = resources[id]
  if (resource.ready) return
  resource.ready = true
  resource.error = false
  resource.loadedBytes = resource.totalBytes
  resource.downloadComplete = true
  publish()
}

export function markCriticalResourceError(id: CriticalResourceId, error?: unknown) {
  const resource = resources[id]
  if (resource.ready) return
  resource.error = true
  publish()
  if (error) console.error(`[critical-loading] ${id} failed to become ready`, error)
}

export function subscribeCriticalResources(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCriticalResourceSnapshot() {
  return snapshot
}

export const CRITICAL_RESOURCE_URLS = {
  model: resources.model.url,
  environment: resources.environment.url,
  hero: resources.hero.url,
} as const
