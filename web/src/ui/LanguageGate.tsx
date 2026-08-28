import { useEffect, useRef } from 'react'
import type { CriticalResourceSnapshot } from '../preloadAssets'

type Lang = 'en' | 'zh'
type GatePhase = 'language' | 'loading' | 'ready' | 'turning'

const COPY = {
  zh: {
    choose: '选择语言',
    subtitle: '欢迎来到乔思萌的数字作品集',
    preparing: '正在准备数字手帐…',
    portrait: '正在加载 3D 形象…',
    atmosphere: '正在准备场景光影…',
    almost: '马上就好…',
    ready: '准备完成。',
    partial: '部分内容仍在加载',
    enter: '先进入主页 →',
  },
  en: {
    choose: 'Choose a language',
    subtitle: "Welcome to Qiao Simeng's digital portfolio",
    preparing: 'Preparing the scrapbook…',
    portrait: 'Loading the 3D portrait…',
    atmosphere: 'Preparing the atmosphere…',
    almost: 'Almost ready…',
    ready: 'Ready.',
    partial: 'Some content is still loading',
    enter: 'Enter now →',
  },
} as const

function getStatus(
  lang: Lang,
  phase: GatePhase,
  progress: number,
  critical: CriticalResourceSnapshot,
) {
  const copy = COPY[lang]
  if ((phase === 'ready' || phase === 'turning') && critical.allReady) return copy.ready
  if (critical.hasError) return copy.partial
  if (progress < 2) return copy.preparing
  if (!critical.resources.model.ready) return copy.portrait
  if (!critical.resources.environment.ready) return copy.atmosphere
  if (!critical.resources.hero.ready) return copy.preparing
  return copy.almost
}

export default function LanguageGate({
  onChoose,
  onEnterNow,
  phase,
  lang,
  progress,
  critical,
  canEnterNow,
}: {
  onChoose: (lang: Lang) => void
  onEnterNow: () => void
  phase: GatePhase
  lang: Lang
  progress: number
  critical: CriticalResourceSnapshot
  canEnterNow: boolean
}) {
  const zhRef = useRef<HTMLButtonElement>(null)
  const loading = phase !== 'language'
  const turning = phase === 'turning'
  const percentage = critical.allReady ? 100 : Math.min(99, Math.max(0, Math.round(progress)))
  const status = getStatus(lang, phase, progress, critical)
  const copy = COPY[lang]

  useEffect(() => {
    if (phase === 'language') zhRef.current?.focus()
  }, [phase])

  return (
    <div
      className={`lang-gate${loading ? ' is-loading' : ''}${turning ? ' is-turning' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lg-title"
      data-critical-ready={critical.allReady ? 'true' : 'false'}
    >
      <div className="lang-gate-page-shadow" aria-hidden="true" />
      <div className="lang-gate-journal">
        <span className="lang-gate-tape" aria-hidden="true" />
        <p className="lang-gate-kicker">PORTFOLIO · 2026</p>
        <h1 className="lang-gate-title" id="lg-title">
          MENG&apos;S PORTFOLIO
        </h1>
        <p className="lang-gate-sub">
          {phase === 'language' ? '请选择浏览语言 · Choose your language' : copy.subtitle}
        </p>

        <div className="lang-gate-tip" role="note" aria-hidden={loading}>
          <span className="lg-tip-label">温馨提示 · A small note</span>
          <span className="lg-tip-text">
            网站包含随滚动播放的 3D 人物与镜头动画，首次准备可能需要一点时间。
          </span>
          <span className="lg-tip-text-en">
            The portfolio includes a scroll-driven 3D portrait, so the first visit may take a moment.
          </span>
        </div>

        <div className={`lang-gate-flow${loading ? ' is-loading' : ''}`}>
          <div className="lang-gate-buttons" aria-hidden={loading}>
            <button
              ref={zhRef}
              type="button"
              className="lang-gate-btn is-zh"
              onClick={() => onChoose('zh')}
              disabled={loading}
            >
              <span className="lg-btn-main">中文</span>
              <span className="lg-btn-sub">简体中文</span>
            </button>
            <button
              type="button"
              className="lang-gate-btn is-en"
              onClick={() => onChoose('en')}
              disabled={loading}
            >
              <span className="lg-btn-main">English</span>
              <span className="lg-btn-sub">English</span>
            </button>
          </div>

          <div className="lang-gate-loading" aria-hidden={!loading}>
            <p className="lg-loading-heading">{copy.preparing}</p>
            <div className="lg-progress-row">
              <div
                className="lg-progress"
                role="progressbar"
                aria-label={lang === 'zh' ? '首屏关键资源加载进度' : 'Critical resource loading progress'}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
              >
                <span className="lg-progress-fill" style={{ transform: `scaleX(${percentage / 100})` }} />
              </div>
              <span className="lg-progress-value" aria-hidden="true">
                {percentage}%
              </span>
            </div>
            <p className="lg-loading-status" aria-live="polite" aria-atomic="true">
              {status}
            </p>
            <button
              className={`lg-enter-now${canEnterNow ? ' is-visible' : ''}`}
              type="button"
              onClick={onEnterNow}
              tabIndex={canEnterNow ? 0 : -1}
              aria-hidden={!canEnterNow}
            >
              {copy.enter}
            </button>
          </div>
        </div>

        <p className="lang-gate-hint" aria-hidden="true">
          {phase === 'language' ? copy.choose : 'DIGITAL SCRAPBOOK · QIAO SIMENG'}
        </p>
      </div>
    </div>
  )
}
