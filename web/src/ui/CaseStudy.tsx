import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projectNova } from '../data/projectNova'

const EASE = [0.22, 1, 0.36, 1]

// PROJECT NOVA 完整 Case Study 阅读层。
// 复用 WorkDetail 的「fixed overlay + 滚动锁定」模式（滚动锁定在 Works.tsx 中统一处理），
// 但拥有独立的深空主题视觉与 6 段式结构。不销毁 / 重建 Three.js 场景，不修改 Scene.tsx。
export default function CaseStudy({ onClose }: { onClose: () => void }) {
  const d = projectNova
  const [lightbox, setLightbox] = useState(false)

  // Lightbox 的 ESC 优先于面板关闭：capture 阶段拦截，避免冒泡到 Works 的 ESC 处理器
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setLightbox(false)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [lightbox])

  return (
    <>
      <motion.div
        className="cs-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      <motion.div
        className="cs-panel"
        initial={{ opacity: 0, scale: 0.985, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 6 }}
        transition={{ duration: 0.42, ease: EASE }}
        role="dialog"
        aria-modal="true"
        aria-label={`${d.name} Case Study`}
      >
        <button className="cs-close" onClick={onClose} aria-label="Back to portfolio">
          ✕
        </button>

        {/* ── HERO ── */}
        <header className="cs-hero">
          <img
            className="cs-hero-img"
            src={d.composite}
            alt={`${d.name} — Main Menu`}
            loading="lazy"
            decoding="async"
          />
          <div className="cs-hero-scrim" />
          <div className="cs-hero-text">
            <span className="cs-kicker">CASE STUDY</span>
            <h1 className="cs-title">{d.name}</h1>
            <p className="cs-category">{d.category}</p>
            <div className="cs-meta">
              <div className="cs-meta-item">
                <span>Type</span>
                <b>{d.type}</b>
              </div>
              <div className="cs-meta-item">
                <span>Development Period</span>
                <b>{d.period}</b>
              </div>
              <div className="cs-meta-item cs-meta-role">
                <span>Role</span>
                <b>{d.role.join(' · ')}</b>
              </div>
            </div>
          </div>
        </header>

        {/* ── 01 / PROJECT BACKGROUND ── */}
        <section className="cs-sec">
          <h2 className="cs-sec-h">
            <span className="cs-no">01</span> PROJECT BACKGROUND
          </h2>
          <div className="cs-prose">
            {d.background.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* ── 02 / MY ROLE ── */}
        <section className="cs-sec">
          <h2 className="cs-sec-h">
            <span className="cs-no">02</span> MY ROLE
          </h2>
          <div className="cs-roles">
            {d.roleSections.map((rs) => (
              <div className="cs-role" key={rs.heading}>
                <h3 className="cs-role-h">{rs.heading}</h3>
                {rs.paragraphs.map((p, i) => (
                  <p key={i} className="cs-role-p">
                    {p}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── 03 / TECH STACK ── */}
        <section className="cs-sec">
          <h2 className="cs-sec-h">
            <span className="cs-no">03</span> TECH STACK
          </h2>
          <div className="cs-tech-grid">
            {d.techStack.map((t) => (
              <div className="cs-tech" key={t.name}>
                <b className="cs-tech-name">{t.name}</b>
                <p className="cs-tech-desc">{t.desc}</p>
              </div>
            ))}
          </div>
          <p className="cs-codex-note">{d.codexNote}</p>
        </section>

        {/* ── 04 / DEVELOPMENT ── */}
        <section className="cs-sec">
          <h2 className="cs-sec-h">
            <span className="cs-no">04</span> DEVELOPMENT
          </h2>
          <ol className="cs-timeline">
            {d.timeline.map((step) => (
              <li className="cs-step" key={step.no}>
                <span className="cs-step-no">{step.no}</span>
                <div className="cs-step-body">
                  <b className="cs-step-title">{step.title}</b>
                  <p className="cs-step-desc">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 05 / GALLERY ── */}
        <section className="cs-sec">
          <h2 className="cs-sec-h">
            <span className="cs-no">05</span> GALLERY
          </h2>
          <button
            className="cs-gallery"
            onClick={() => setLightbox(true)}
            aria-label="Open gameplay gallery"
          >
            <img
              src={d.composite}
              alt="PROJECT NOVA gameplay filmstrip"
              loading="lazy"
              decoding="async"
            />
            <span className="cs-gallery-hint">点击查看大图 ↗</span>
          </button>
          <div className="cs-caps">
            {d.gallery.map((g) => (
              <div className="cs-cap" key={g.no}>
                <span className="cs-cap-no">{g.no}</span>
                <b className="cs-cap-title">{g.title}</b>
                <p className="cs-cap-text">{g.caption}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 06 / RESULT ── */}
        <section className="cs-sec">
          <h2 className="cs-sec-h">
            <span className="cs-no">06</span> RESULT
          </h2>
          <div className="cs-flow">
            {d.resultFlow.map((f, i) => (
              <span key={f} className="cs-flow-item">
                <span className="cs-flow-node">{f}</span>
                {i < d.resultFlow.length - 1 && (
                  <span className="cs-flow-arrow" aria-hidden="true">
                    ↓
                  </span>
                )}
              </span>
            ))}
          </div>
          <div className="cs-supports">
            {d.resultSupports.map((s) => (
              <span className="cs-chip" key={s}>
                {s}
              </span>
            ))}
          </div>
          <div className="cs-prose">
            {d.resultText.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </section>

        {/* ── FINAL STATUS ── */}
        <section className="cs-final">
          <div className="cs-final-badge">{d.finalStatus.version}</div>
          <p className="cs-final-tag">{d.finalStatus.tagline}</p>
          {d.finalStatus.lines.map((l) => (
            <p className="cs-final-line" key={l}>
              {l}
            </p>
          ))}
        </section>

        {/* ── ACTION BUTTONS（无真实地址 → 占位不跳转） ── */}
        <div className="cs-actions">
          <span className="cs-btn is-ph" role="button" aria-disabled="true">
            {d.viewProject}
          </span>
          <span className="cs-btn is-ph" role="button" aria-disabled="true">
            {d.viewSource}
          </span>
        </div>

        {/* ── DEVELOPMENT NOTE ── */}
        <p className="cs-devnote">{d.devNote}</p>
      </motion.div>

      {/* ── GALLERY LIGHTBOX ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="cs-lb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setLightbox(false)}
          >
            <button className="cs-lb-close" onClick={() => setLightbox(false)} aria-label="Close gallery">
              ✕
            </button>
            <img
              className="cs-lb-img"
              src={d.composite}
              alt="PROJECT NOVA gameplay filmstrip — enlarged"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="cs-lb-cap">PROJECT NOVA — Gameplay Filmstrip · 01 Main Menu → 06 Victory</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
