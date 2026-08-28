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

// 阻塞开门的图片：只包含「进入主页就能看到」的部分。
//
// 之前把 43 张图（含点击才看的证书原图、详情 banner）全部塞进开门条件，
// 实测导致进度条十几分钟都走不完，且解码内存高达 290MB。现在改为：
//   · 进门可见的图 —— 照常等待，且尺寸已优化到显示尺寸的 2 倍（视网膜屏无损）
//   · 点击才看的图 —— 画质完全不变，改为进门后空闲预热，不再占用开门时间
// 字节数与 public/ 下的实际文件一致，保证进度条按真实体积加权。
const BLOCKING_IMAGES: ReadonlyArray<{ path: string; bytes: number }> = [
  { path: 'works/optimized/ai-cover.webp', bytes: 51_368 },
  { path: 'works/optimized/economics-cover.webp', bytes: 47_548 },
  { path: 'works/optimized/expression-writing-cover.webp', bytes: 59_158 },
  { path: 'works/optimized/programming-cover.webp', bytes: 45_226 },
  { path: 'works/optimized/project-nova-cover.webp', bytes: 35_760 },
  { path: 'certificates/thumbs/certificate-agent-engineer-ant.webp', bytes: 28_242 },
  { path: 'certificates/thumbs/certificate-agent-engineer-iflytek.webp', bytes: 37_244 },
  { path: 'certificates/thumbs/certificate-ai-coding-marscode.webp', bytes: 28_586 },
  { path: 'certificates/thumbs/certificate-ai4s-python.webp', bytes: 35_372 },
  { path: 'certificates/thumbs/certificate-alibaba-cloud-clouder.webp', bytes: 27_798 },
  { path: 'certificates/thumbs/certificate-finetuning-engineer.webp', bytes: 37_066 },
  { path: 'certificates/thumbs/certificate-huawei-ai-fundamentals.webp', bytes: 17_252 },
  { path: 'certificates/thumbs/certificate-llm-development-datawhale.webp', bytes: 26_144 },
  { path: 'certificates/thumbs/certificate-llm-engineer-virtai.webp', bytes: 34_460 },
  { path: 'certificates/thumbs/certificate-prompt-engineer-iflytek.webp', bytes: 37_152 },
  { path: 'certificates/thumbs/certificate-prompt-engineer-spark.webp', bytes: 26_530 },
  { path: 'scrapbook/paper-texture-seamless.webp', bytes: 6_598 },
  { path: 'scrapbook/polaroid-frame-1.webp', bytes: 112_534 },
  { path: 'images/buzyzheng.png', bytes: 290_268 },
  { path: 'images/bp.png', bytes: 8_391 },
  { path: 'images/hotsar.jpg', bytes: 6_760 },
]

// 点击才查看的图片：画质保持原样（证书 2400px、详情 banner 2000px），
// 但不在开门时下载；进门后空闲时段再低优先级预热，保证真点开时依然秒开。
const DEFERRED_IMAGES: ReadonlyArray<string> = [
  'certificates/originals/certificate-agent-engineer-ant.webp',
  'certificates/originals/certificate-agent-engineer-iflytek.webp',
  'certificates/originals/certificate-ai-coding-marscode.webp',
  'certificates/originals/certificate-ai4s-python.webp',
  'certificates/originals/certificate-alibaba-cloud-clouder.webp',
  'certificates/originals/certificate-finetuning-engineer.webp',
  'certificates/originals/certificate-huawei-ai-fundamentals.webp',
  'certificates/originals/certificate-llm-development-datawhale.webp',
  'certificates/originals/certificate-llm-engineer-virtai.webp',
  'certificates/originals/certificate-prompt-engineer-iflytek.webp',
  'certificates/originals/certificate-prompt-engineer-spark.webp',
  'works/covers/ai.webp',
  'works/covers/economics.webp',
  'works/covers/expression-writing-image-one.webp',
  'works/covers/programming.webp',
  'images/english-competition-image-two.png',
  'works/nova/gallery-composite.webp',
]

const IMAGE_MANIFEST = BLOCKING_IMAGES

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

// 预热「进门即可见」的图片并计入进度。
//
// 修正了导致「10 分钟没下载完」的四个问题：
//  1. 限并发（6）——之前 43 张一次性打出，把连接池打满，8.5MB 的 3D 模型被挤到队尾，
//     总体反而更慢；限并发后模型先下完，总耗时更短。
//  2. 持有 Image 引用——之前图片只存在局部变量里，未完成的加载可能被 GC 取消，
//     回调永不触发，进度条会永久卡住（最可能的卡死原因）。
//  3. 用 decode()——onload 只代表字节到达，不代表可以无成本绘制；
//     decode() 之后「100%」才真正等于可用，滚动时不会再有解码掉帧。
//  4. 硬超时——任何异常都不会把访客永久挡在门外。
const IMAGE_CONCURRENCY = 6
const IMAGE_TIMEOUT_MS = 20_000
const pendingImages: HTMLImageElement[] = [] // 持有引用，防止未完成的加载被 GC

function preloadImages() {
  const aggregate = resources.images
  if (aggregate.ready) return
  let settled = 0
  let loaded = 0
  let stopped = false

  const finish = () => {
    if (aggregate.ready) return
    aggregate.loadedBytes = aggregate.totalBytes
    aggregate.downloadComplete = true
    aggregate.ready = true
    publish()
  }

  const registerDone = (bytes: number) => {
    if (stopped) return
    loaded = Math.min(loaded + bytes, aggregate.totalBytes)
    aggregate.loadedBytes = loaded
    settled += 1
    if (settled >= IMAGE_MANIFEST.length) finish()
    else publish()
  }

  // 硬超时兜底
  window.setTimeout(() => {
    stopped = true
    finish()
  }, IMAGE_TIMEOUT_MS)

  let cursor = 0
  const startNext = () => {
    if (stopped || cursor >= IMAGE_MANIFEST.length) return
    const entry = IMAGE_MANIFEST[cursor]
    cursor += 1
    const image = new Image()
    image.decoding = 'async'
    pendingImages.push(image)
    const done = () => {
      registerDone(entry.bytes)
      startNext() // 完成一个补一个，维持有限并发
    }
    image.onload = () => {
      // decode() 让「100%」代表真正可用，而不是仅代表下载完成
      const withDecode = image as HTMLImageElement & { decode?: () => Promise<void> }
      if (typeof withDecode.decode === 'function') {
        withDecode.decode().then(done, done)
      } else {
        done()
      }
    }
    image.onerror = done // 单张失败不阻塞开门
    image.src = absoluteAssetUrl(entry.path)
  }

  for (let i = 0; i < IMAGE_CONCURRENCY; i += 1) startNext()
}

// 进门之后再空闲预热「点击才看」的图：画质完全不变，只是不与开门抢带宽。
let deferredWarmed = false
export function warmDeferredImages() {
  if (deferredWarmed || typeof window === 'undefined') return
  deferredWarmed = true
  const run = () => {
    DEFERRED_IMAGES.forEach((path) => {
      const image = new Image()
      image.decoding = 'async'
      if ('fetchPriority' in image) image.fetchPriority = 'low'
      pendingImages.push(image)
      image.src = absoluteAssetUrl(path)
    })
  }
  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number
  }).requestIdleCallback
  if (idle) idle(run, { timeout: 6_000 })
  else window.setTimeout(run, 3_000)
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
