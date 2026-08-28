import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import LanguageGate from './ui/LanguageGate'
import SceneErrorBoundary from './scene/SceneErrorBoundary'
import {
  getCriticalResourceSnapshot,
  markCriticalResourceError,
  markCriticalResourceReady,
  subscribeCriticalResources,
} from './preloadAssets'

// These two chunks start in parallel behind the lightweight HTML gate. The
// full Portfolio/Framer UI no longer delays the gate's first paint.
const SceneStage = lazy(() => import('./scene/SceneStage'))
const PortfolioContent = lazy(() => import('./PortfolioContent'))

type Lang = 'en' | 'zh'
type GatePhase = 'language' | 'loading' | 'ready' | 'turning'

const LS_LANG = 'portfolio-language'
const READY_HOLD_MS = 280
const PAGE_TURN_MS = 860
const REDUCED_TURN_MS = 260

function readStoredLang(): Lang | null {
  try {
    const value = localStorage.getItem(LS_LANG)
    return value === 'en' || value === 'zh' ? value : null
  } catch {
    return null
  }
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

export default function App() {
  const [stored] = useState<Lang | null>(readStoredLang)
  const [lang, setLang] = useState<Lang>(stored ?? 'zh')
  const [showGate, setShowGate] = useState(true)
  const [gatePhase, setGatePhase] = useState<GatePhase>(stored ? 'loading' : 'language')
  const [slowEscape, setSlowEscape] = useState(false)
  const [displayProgress, setDisplayProgress] = useState(0)
  const [modelReady, setModelReady] = useState(false)
  const [portfolioReady, setPortfolioReady] = useState(false)
  const critical = useSyncExternalStore(
    subscribeCriticalResources,
    getCriticalResourceSnapshot,
    getCriticalResourceSnapshot,
  )
  const gateTimers = useRef<number[]>([])
  const entranceReady = critical.allReady && portfolioReady
  const gateCritical = entranceReady ? critical : { ...critical, allReady: false }

  const clearGateTimers = useCallback(() => {
    gateTimers.current.forEach((timer) => window.clearTimeout(timer))
    gateTimers.current = []
  }, [])

  const handleModelReady = useCallback(() => {
    setModelReady(true)
    markCriticalResourceReady('model')
  }, [])

  const handlePortfolioReady = useCallback(() => setPortfolioReady(true), [])

  const handleSceneError = useCallback((error: unknown) => {
    markCriticalResourceError('model', error)
    markCriticalResourceError('hero', error)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    document.body.style.overflow = showGate ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [showGate])

  // Smoothly catch up to measured progress, never beyond its safe ceiling.
  useEffect(() => {
    const target = entranceReady ? 100 : Math.min(99, critical.progress)
    let frame = 0
    const advance = () => {
      let settled = false
      setDisplayProgress((current) => {
        if (current >= target) {
          settled = true
          return current
        }
        const step = Math.max(0.25, (target - current) * 0.14)
        const next = Math.min(target, current + step)
        settled = target - next < 0.05
        return settled ? target : next
      })
      if (!settled) frame = window.requestAnimationFrame(advance)
    }
    frame = window.requestAnimationFrame(advance)
    return () => window.cancelAnimationFrame(frame)
  }, [critical.progress, entranceReady])

  useEffect(() => {
    const timer = window.setTimeout(() => setSlowEscape(true), 8_000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showGate || gatePhase !== 'loading' || !entranceReady || displayProgress < 99.95) return
    setGatePhase('ready')
  }, [displayProgress, entranceReady, gatePhase, showGate])

  useEffect(() => {
    if (gatePhase !== 'ready') return
    const timer = window.setTimeout(() => setGatePhase('turning'), READY_HOLD_MS)
    gateTimers.current.push(timer)
    return () => window.clearTimeout(timer)
  }, [gatePhase])

  useEffect(() => {
    if (gatePhase !== 'turning') return
    const duration = prefersReducedMotion() ? REDUCED_TURN_MS : PAGE_TURN_MS
    const timer = window.setTimeout(() => {
      setShowGate(false)
      window.scrollTo(0, 0)
    }, duration)
    gateTimers.current.push(timer)
    return () => window.clearTimeout(timer)
  }, [gatePhase])

  useEffect(() => clearGateTimers, [clearGateTimers])

  const chooseLang = (nextLang: Lang) => {
    if (gatePhase !== 'language') return
    try {
      localStorage.setItem(LS_LANG, nextLang)
    } catch {
      // Privacy modes may reject storage; the in-memory language still works.
    }
    setLang(nextLang)
    setGatePhase('loading')
  }

  const enterNow = () => {
    if (gatePhase === 'loading') setGatePhase('turning')
  }

  const openGate = () => {
    clearGateTimers()
    window.scrollTo(0, 0)
    setShowGate(true)
    setGatePhase('language')
  }

  return (
    <>
      <SceneErrorBoundary onError={handleSceneError}>
        <Suspense fallback={null}>
          <SceneStage modelReady={modelReady} onModelReady={handleModelReady} />
        </Suspense>
      </SceneErrorBoundary>

      <Suspense fallback={null}>
        <PortfolioContent
          lang={lang}
          gateOpen={showGate}
          onChangeLanguage={openGate}
          onReady={handlePortfolioReady}
        />
      </Suspense>

      {showGate && (
        <LanguageGate
          onChoose={chooseLang}
          onEnterNow={enterNow}
          phase={gatePhase}
          lang={lang}
          progress={displayProgress}
          critical={gateCritical}
          canEnterNow={(slowEscape || critical.hasError) && !entranceReady}
        />
      )}
    </>
  )
}
