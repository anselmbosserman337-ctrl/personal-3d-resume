import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Skills from './ui/Skills'
import Works from './ui/Works'
import Certificates from './ui/Certificates'
import Contact from './ui/Contact'
import Navigation from './ui/Navigation'

type Lang = 'en' | 'zh'

const COPY = {
  en: {
    title: 'Qiao Simeng',
    paragraphs: [
      'An incoming Economics student at Minzu University of China, exploring the intersection of economics, data and AI.',
      'I believe in steady effort: small progress every day shapes the final result.',
    ],
  },
  zh: {
    title: 'About Meng',
    paragraphs: [
      '中央民族大学经济学专业准大一新生，来自安徽芜湖，共青团员。',
      '探索经济学、数据与 AI 的交叉可能；相信长期主义，也相信每一天的微小积累。',
    ],
  },
}

function Hero({ lang, cueOpacity }: { lang: Lang; cueOpacity: MotionValue<number> }) {
  const { title, paragraphs } = COPY[lang]
  const aboutRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero" id="home">
      <motion.div className="about" id="about" lang={lang} ref={aboutRef} style={{ opacity }}>
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {title}
          </motion.h1>
          {paragraphs.map((paragraph, index) => (
            <motion.p key={index} className="about-body" style={{ y: bodyY }}>
              {paragraph}
            </motion.p>
          ))}
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        <span className="scroll-cue-label">{lang === 'en' ? 'SCROLL' : '向下滚动'}</span>
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      className="lang-toggle"
      onClick={onToggle}
      aria-label="更改语言 / Change language"
      title="更改语言 / Change language"
    >
      <span className="lang-toggle-glyph" aria-hidden="true">Aあ</span>
      <span className="lang-toggle-text">{lang === 'en' ? '语言' : 'Language'}</span>
    </button>
  )
}

export default function PortfolioContent({
  lang,
  gateOpen,
  onChangeLanguage,
  onReady,
}: {
  lang: Lang
  gateOpen: boolean
  onChangeLanguage: () => void
  onReady: () => void
}) {
  useEffect(() => onReady(), [onReady])
  const { scrollY } = useScroll()
  const worksRef = useRef<HTMLElement>(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(244, 239, 247, 0)', 'rgba(232, 225, 239, 0.26)'],
  )
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.12])
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [viewportHeight * 0.5, viewportHeight * 1.1], [0, 1])
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />
      <motion.div className="stage-fog" style={{ background: fogBg }} aria-hidden="true" />
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {!gateOpen && <LangToggle lang={lang} onToggle={onChangeLanguage} />}

      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        <div className="hero-meta hm-tl">
          <span className="hm-name">Qiao Simeng 乔思萌</span>
          <span>Economics · Data · AI</span>
        </div>
        <div className="hero-meta hm-tr">Portfolio — 2026</div>
        <div className="hero-meta hm-bl">Learn · Think · Grow</div>
        <div className="hero-meta hm-right">Based in Wuhu</div>
      </motion.div>

      <NoiseOverlay />

      <main className="content">
        <Navigation />
        <Hero lang={lang} cueOpacity={cueOpacity} />
        <Resume lang={lang} />
        <Skills lang={lang} />
        <Works lang={lang} innerRef={worksRef} />
        <Certificates lang={lang} />
        <Contact lang={lang} />
      </main>
    </>
  )
}
