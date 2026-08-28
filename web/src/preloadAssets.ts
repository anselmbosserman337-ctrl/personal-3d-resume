import { HERO_BACKGROUND_URL } from './performanceAssets'

export type CriticalResourceId = 'model' | 'environment' | 'hero' | 'images'

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

// 首页滚动时可见的图片（正常优先级，先加载）。
// 字节数与 public/ 下的实际文件一致，用于让进度条按真实体积加权。
const HOMEPAGE_IMAGES: ReadonlyArray<{ path: string; bytes: number }> = [
  { path: 'images/bp.png', bytes: 8_391 },
  { path: 'images/buzyzheng.png', bytes: 290_268 },
  { path: 'images/english-competition-image-two.png', bytes: 359_151 },
  { path: 'images/hotsar.jpg', bytes: 6_760 },
  { path: 'scrapbook/paper-texture-seamless.webp', bytes: 65_336 },
  { path: 'scrapbook/polaroid-frame-1.webp', bytes: 112_534 },
  { path: 'works/covers/ad.jpg', bytes: 161_220 },
  { path: 'works/covers/ai.png', bytes: 245_951 },
  { path: 'works/covers/economics.png', bytes: 229_203 },
  { path: 'works/covers/expression-writing-image-one.png', bytes: 737_849 },
  { path: 'works/covers/expression.png', bytes: 250_891 },
  { path: 'works/covers/graphics.jpg', bytes: 157_328 },
  { path: 'works/covers/maker.jpg', bytes: 92_488 },
  { path: 'works/covers/product.jpg', bytes: 210_535 },
  { path: 'works/covers/programming.png', bytes: 572_984 },
  { path: 'works/optimized/ai-cover.webp', bytes: 51_368 },
  { path: 'works/optimized/economics-cover.webp', bytes: 47_548 },
  { path: 'works/optimized/expression-writing-cover.webp', bytes: 59_158 },
  { path: 'works/optimized/programming-cover.webp', bytes: 45_226 },
  { path: 'works/optimized/project-nova-cover.webp', bytes: 35_760 },
  { path: 'works/nova/gallery-composite.jpg', bytes: 237_945 },
  { path: 'certificates/thumbs/certificate-agent-engineer-ant.webp', bytes: 38_428 },
  { path: 'certificates/thumbs/certificate-agent-engineer-iflytek.webp', bytes: 56_064 },
  { path: 'certificates/thumbs/certificate-ai-coding-marscode.webp', bytes: 37_276 },
  { path: 'certificates/thumbs/certificate-ai4s-python.webp', bytes: 49_570 },
  { path: 'certificates/thumbs/certificate-alibaba-cloud-clouder.webp', bytes: 40_002 },
  { path: 'certificates/thumbs/certificate-finetuning-engineer.webp', bytes: 55_726 },
  { path: 'certificates/thumbs/certificate-huawei-ai-fundamentals.webp', bytes: 24_644 },
  { path: 'certificates/thumbs/certificate-llm-development-datawhale.webp', bytes: 34_030 },
  { path: 'certificates/thumbs/certificate-llm-engineer-virtai.webp', bytes: 47_596 },
  { path: 'certificates/thumbs/certificate-prompt-engineer-iflytek.webp', bytes: 55_906 },
  { path: 'certificates/thumbs/certificate-prompt-engineer-spark.webp', bytes: 36_060 },
]

// 点击才查看的证书原图：开门前同样要等它就绪，但用 low 优先级，
// 不与 3D 人物模型抢带宽（模型先到，原图随后补齐）。
const CLICK_ONLY_IMAGES: ReadonlyArray<{ path: string; bytes: number }> = [
  { path: 'certificates/originals/certificate-agent-engineer-ant.png', bytes: 346_365 },
  { path: 'certificates/originals/certificate-agent-engineer-iflytek.png', bytes: 365_016 },
  { path: 'certificates/originals/certificate-ai-coding-marscode.png', bytes: 148_570 },
  { path: 'certificates/originals/certificate-ai4s-python.png', bytes: 452_837 },
  { path: 'certificates/originals/certificate-alibaba-cloud-clouder.png', bytes: 198_017 },
  { path: 'certificates/originals/certificate-finetuning-engineer.png', bytes: 363_057 },
  { path: 'certificates/originals/certificate-huawei-ai-fundamentals.png', bytes: 165_136 },
  { path: 'certificates/originals/certificate-llm-development-datawhale.png', bytes: 118_646 },
  { path: 'certificates/originals/certificate-llm-engineer-virtai.png', bytes: 384_353 },
  { path: 'certificates/originals/certificate-prompt-engineer-iflytek.png', bytes: 363_434 },
  { path: 'certificates/originals/certificate-prompt-engineer-spark.png', bytes: 319_779 },
]

const IMAGE_MANIFEST: ReadonlyArray<{ path: string; bytes: number; lowPriority: boolean }> = [
  ...HOMEPAGE_IMAGES.map((image) => ({ ...image, lowPriority: false })),
  ...CLICK_ONLY_IMAGES.map((image) => ({ ...image, lowPriority: true })),
]

const IMAGE_TOTAL_BYTES = IMAGE_MANIFEST.reduce((sum, image) => sum + image.bytes, 0)

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
  // 聚合资源：把所有图片合成一项参与进度加权，避免 43 张图各占一格导致进度跳变
  images: {
    id: 'images',
    url: '',
    totalBytes: IMAGE_TOTAL_BYTES,
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
      images: { ...resources.images },
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

// 预热全部图片并把完成度计入进度条。图片不走 fetch，因此按「每张完成即计入其
// 体积」累加到聚合资源上——43 张图足以让进度条平滑推进。
function preloadImages() {
  const aggregate = resources.images
  if (aggregate.ready) return
  let settled = 0
  let loaded = 0

  const registerDone = (bytes: number) => {
    loaded = Math.min(loaded + bytes, aggregate.totalBytes)
    aggregate.loadedBytes = loaded
    settled += 1
    if (settled >= IMAGE_MANIFEST.length) {
      aggregate.loadedBytes = aggregate.totalBytes
      aggregate.downloadComplete = true
      aggregate.ready = true
    }
    publish()
  }

  IMAGE_MANIFEST.forEach(({ path, bytes, lowPriority }) => {
    const image = new Image()
    image.decoding = 'async'
    // 证书原图低优先级：仍然计入进度、仍然阻塞开门，但不与 3D 模型争夺带宽
    if (lowPriority && 'fetchPriority' in image) image.fetchPriority = 'low'
    // 单张失败不阻塞开门：照常计入完成，避免一张 404 让进度条永远停在 99%
    image.onload = () => registerDone(bytes)
    image.onerror = () => registerDone(bytes)
    image.src = absoluteAssetUrl(path)
  })
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
  preloadImages()
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
