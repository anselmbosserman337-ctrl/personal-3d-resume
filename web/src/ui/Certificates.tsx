import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { motion } from 'framer-motion'
import { CERTIFICATES, type Certificate, type Language } from '../data/certificates'

// 与 Works 详情同理：提前在空闲时段拉取弹窗 chunk，点击时即为已就绪状态
const importCertificateModal = () => import('./CertificateModal')
const CertificateModal = lazy(importCertificateModal)
let modalWarmed = false
function warmCertificateModal() {
  if (modalWarmed) return
  modalWarmed = true
  void importCertificateModal()
}

const COPY = {
  zh: {
    eyebrow: 'CERTIFICATES',
    title: 'Selected Achievements & Certifications',
    description: '把每一次认真学习与实践，收藏成持续生长的能力档案。',
    featured: 'FEATURED',
    open: '查看证书',
  },
  en: {
    eyebrow: 'CERTIFICATES',
    title: 'Certificates & Honors',
    description: 'A growing archive of focused learning and hands-on practice.',
    featured: 'FEATURED',
    open: 'Open certificate',
  },
} as const

function CertificateCard({
  certificate,
  index,
  lang,
  isActive,
  onOpen,
  setCardRef,
}: {
  certificate: Certificate
  index: number
  lang: Language
  isActive: boolean
  onOpen: () => void
  setCardRef: (element: HTMLElement | null) => void
}) {
  const copy = COPY[lang]
  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5
    event.currentTarget.style.setProperty('--certificate-tilt-x', `${(-y * 4).toFixed(2)}deg`)
    event.currentTarget.style.setProperty('--certificate-tilt-y', `${(x * 4).toFixed(2)}deg`)
  }

  const resetTilt = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty('--certificate-tilt-x', '0deg')
    event.currentTarget.style.setProperty('--certificate-tilt-y', '0deg')
  }

  return (
    <motion.article
      ref={setCardRef}
      className={`certificate-card${certificate.featured ? ' is-featured' : ''}${isActive ? ' is-active' : ''}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.58, delay: Math.min(index * 0.07, 0.7), ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        className="certificate-card-surface"
        type="button"
        onClick={onOpen}
        onPointerEnter={warmCertificateModal}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        aria-label={`${copy.open}: ${certificate.title[lang]}`}
      >
        <span className="certificate-card-sheen" aria-hidden="true" />
        <span className="certificate-card-image-wrap">
          <img src={certificate.thumbnail} alt={certificate.title[lang]} loading="lazy" decoding="async" />
        </span>
        <span className="certificate-card-copy">
          <span className="certificate-card-title-row">
            <span className="certificate-card-title">{certificate.title[lang]}</span>
            {certificate.featured && <span className="certificate-card-featured">{copy.featured}</span>}
          </span>
          <span className="certificate-card-meta">{certificate.issuer}</span>
          <span className="certificate-card-meta is-secondary">{certificate.category[lang]}{certificate.date ? ` · ${certificate.date[lang]}` : ''}</span>
        </span>
      </button>
    </motion.article>
  )
}

export default function Certificates({ lang }: { lang: Language }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLElement | null)[]>([])
  const scrollFrame = useRef<number | null>(null)
  const mouseDrag = useRef({ active: false, startX: 0, startScrollLeft: 0, moved: false })
  const copy = COPY[lang]
  const setOverlayOpen = useStore((s) => s.setOverlayOpen)
  const activeCertificate = activeIndex === null ? null : CERTIFICATES[activeIndex]

  // 证书大图浮层打开（含退场）期间暂停 3D：
  // 既省下 GPU，也避免全屏 backdrop-filter 对实时变化画面反复做模糊。
  useEffect(() => {
    if (activeCertificate) {
      setOverlayOpen(true)
      return
    }
    const t = window.setTimeout(() => setOverlayOpen(false), 460)
    return () => window.clearTimeout(t)
  }, [activeCertificate, setOverlayOpen])

  // 空闲时段预热弹窗 chunk（与卡片悬停预热互为兜底）
  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback
    if (idle) {
      const id = idle(() => warmCertificateModal(), { timeout: 3000 })
      return () => {
        const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback
        cancel?.(id)
      }
    }
    const t = window.setTimeout(warmCertificateModal, 2200)
    return () => window.clearTimeout(t)
  }, [])
  const changeActive = (direction: number) => {
    setActiveIndex((current) => current === null ? null : (current + direction + CERTIFICATES.length) % CERTIFICATES.length)
  }

  const updateShowcaseIndex = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return
    const carouselCenter = carousel.getBoundingClientRect().left + carousel.clientWidth / 2
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const bounds = card.getBoundingClientRect()
      const distance = Math.abs(bounds.left + bounds.width / 2 - carouselCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    setShowcaseIndex((current) => current === closestIndex ? current : closestIndex)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateShowcaseIndex)
    window.addEventListener('resize', updateShowcaseIndex)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateShowcaseIndex)
    }
  }, [updateShowcaseIndex])

  const handleScroll = () => {
    if (scrollFrame.current !== null) return
    scrollFrame.current = window.requestAnimationFrame(() => {
      updateShowcaseIndex()
      scrollFrame.current = null
    })
  }

  const moveShowcase = (direction: number) => {
    const nextIndex = Math.min(Math.max(showcaseIndex + direction, 0), CERTIFICATES.length - 1)
    const target = cardRefs.current[nextIndex]
    target?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    const carousel = event.currentTarget
    mouseDrag.current = { active: true, startX: event.clientX, startScrollLeft: carousel.scrollLeft, moved: false }
    carousel.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mouseDrag.current.active || event.pointerType !== 'mouse') return
    const offset = event.clientX - mouseDrag.current.startX
    if (Math.abs(offset) > 3) mouseDrag.current.moved = true
    event.currentTarget.scrollLeft = mouseDrag.current.startScrollLeft - offset
  }

  const endPointerDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!mouseDrag.current.active || event.pointerType !== 'mouse') return
    mouseDrag.current.active = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    window.setTimeout(() => {
      mouseDrag.current.moved = false
    }, 0)
  }

  return (
    <section className="certificates" id="certificates" lang={lang}>
      <div className="certificates-inner">
        <motion.header
          className="certificates-heading"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="certificates-eyebrow">{copy.eyebrow}</span>
          <h2>{copy.title}</h2>
          <p>{copy.description}</p>
          <span className="certificates-count"><strong>{CERTIFICATES.length}</strong> CERTIFICATES</span>
        </motion.header>

        <div className="certificate-showcase">
          <div className="certificate-showcase-tools" aria-label={lang === 'zh' ? '证书展示控制' : 'Certificate showcase controls'}>
            <button
              className="certificate-showcase-arrow"
              type="button"
              onClick={() => moveShowcase(-1)}
              disabled={showcaseIndex === 0}
              aria-label={lang === 'zh' ? '查看上一张证书' : 'View previous certificate'}
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className="certificate-showcase-progress" aria-live="polite">
              <span>{String(showcaseIndex + 1).padStart(2, '0')} / {String(CERTIFICATES.length).padStart(2, '0')}</span>
              <span className="certificate-showcase-progress-track" aria-hidden="true">
                <span style={{ transform: `scaleX(${(showcaseIndex + 1) / CERTIFICATES.length})` }} />
              </span>
            </div>
            <button
              className="certificate-showcase-arrow"
              type="button"
              onClick={() => moveShowcase(1)}
              disabled={showcaseIndex === CERTIFICATES.length - 1}
              aria-label={lang === 'zh' ? '查看下一张证书' : 'View next certificate'}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="certificate-showcase-shell">
            <div
              className="certificate-showcase-viewport"
              ref={carouselRef}
              onScroll={handleScroll}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endPointerDrag}
              onPointerCancel={endPointerDrag}
            >
              <div className="certificate-showcase-track">
                {CERTIFICATES.map((certificate, index) => (
                  <CertificateCard
                    key={certificate.id}
                    certificate={certificate}
                    index={index}
                    lang={lang}
                    isActive={showcaseIndex === index}
                    setCardRef={(element) => { cardRefs.current[index] = element }}
                    onOpen={() => {
                      if (!mouseDrag.current.moved) setActiveIndex(index)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 打印专用：证书文本清单（屏幕隐藏，@media print 显示）── */}
      <div className="certificates-print" aria-hidden="true">
        <h3 className="certificates-print-title">{copy.title}</h3>
        <ul className="certificates-print-list">
          {CERTIFICATES.map((c) => (
            <li key={c.id} className="certificates-print-item">
              <span className="certificates-print-name">{c.title[lang]}</span>
              <span className="certificates-print-meta">
                {c.issuer}
                {c.category ? ` · ${c.category[lang]}` : ''}
                {c.date ? ` · ${c.date[lang]}` : ''}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {activeCertificate && (
        <Suspense fallback={<div className="wk-detail-tap" aria-hidden="true" />}>
          <CertificateModal
            certificate={activeCertificate}
            index={activeIndex ?? 0}
            total={CERTIFICATES.length}
            lang={lang}
            onClose={() => setActiveIndex(null)}
            onPrevious={() => changeActive(-1)}
            onNext={() => changeActive(1)}
          />
        </Suspense>
      )}
    </section>
  )
}
