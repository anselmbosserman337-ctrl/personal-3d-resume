import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Certificate, Language } from '../data/certificates'

interface CertificateModalProps {
  certificate: Certificate | null
  index: number
  total: number
  lang: Language
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}

export default function CertificateModal({
  certificate,
  index,
  total,
  lang,
  onClose,
  onPrevious,
  onNext,
}: CertificateModalProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!certificate) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrevious()
      if (event.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [certificate, onClose, onNext, onPrevious])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'touch') return
    touchStart.current = { x: event.clientX, y: event.clientY }
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start || event.pointerType !== 'touch') return
    const x = event.clientX - start.x
    const y = event.clientY - start.y
    if (Math.abs(x) < 56 || Math.abs(x) <= Math.abs(y)) return
    if (x < 0) onNext()
    else onPrevious()
  }

  return (
    <AnimatePresence>
      {certificate && (
        <motion.div
          className="certificate-modal"
          role="dialog"
          aria-modal="true"
          aria-label={certificate.title[lang]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="certificate-modal-panel"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div className="certificate-modal-bar">
              <div>
                <span className="certificate-modal-kicker">{certificate.category[lang]}</span>
                <h3>{certificate.title[lang]}</h3>
              </div>
              <button className="certificate-modal-close" type="button" onClick={onClose} aria-label={lang === 'zh' ? '关闭预览' : 'Close preview'}>
                ×
              </button>
            </div>

            <div className="certificate-modal-image-wrap">
              <AnimatePresence mode="wait">
                <motion.img
                  key={certificate.id}
                  className="certificate-modal-image"
                  src={certificate.original}
                  alt={certificate.title[lang]}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                />
              </AnimatePresence>
            </div>

            <div className="certificate-modal-footer">
              <button className="certificate-modal-nav" type="button" onClick={onPrevious} aria-label={lang === 'zh' ? '上一张证书' : 'Previous certificate'}>
                <span aria-hidden="true">←</span> {lang === 'zh' ? '上一张' : 'Previous'}
              </button>
              <span aria-live="polite">{index + 1} / {total}</span>
              <button className="certificate-modal-nav" type="button" onClick={onNext} aria-label={lang === 'zh' ? '下一张证书' : 'Next certificate'}>
                {lang === 'zh' ? '下一张' : 'Next'} <span aria-hidden="true">→</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
