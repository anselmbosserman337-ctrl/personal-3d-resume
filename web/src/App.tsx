import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Skills from './ui/Skills'
import Works from './ui/Works'
import Certificates from './ui/Certificates'
import Contact from './ui/Contact'
import Navigation from './ui/Navigation'
import LoadingScreen from './ui/LoadingScreen'
import LanguageGate from './ui/LanguageGate'
import { useStore } from './store'

// 语言记忆：仅用简单的 zh / en。首次访问（无此 key）弹语言门；之后记住选择，
// 但仍保留「更改语言」入口。不会机翻整份简历——英文文案本就已存在于各数据源。
const LS_LANG = 'portfolio-language'

function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(LS_LANG)
    return v === 'en' || v === 'zh' ? v : null
  } catch {
    return null
  }
}

function Backdrop() {
  // 点击空白处收起详情
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function SceneBackground({ modelReady, onModelReady }: { modelReady: boolean; onModelReady: () => void }) {
  return (
    <>
      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ alpha: true, antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <Suspense fallback={null}>
            <Backdrop />
            <Scene onModelReady={onModelReady} />
          </Suspense>
        </Canvas>
      </div>
      <div className={`scene-loading-wash${modelReady ? ' is-hidden' : ''}`} aria-hidden="true" />
    </>
  )
}

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
  // 触发起点提前：about 顶部位于视口 60% 处即开始（offset[0] 进度 0），到达顶部为进度 1
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  // 透明度在 about 顶部升到约 30vh 时归 0：起点 60%→进度 p 时顶部在 0.6×(1−p)，
  // 令 =0.3 解得 p=0.5，故 opacity 区间 [0, 0.5]
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // 视差：标题上升更快、字距随滚动拉开；正文上升慢一点
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero" id="home">
      <motion.div
        className="about"
        id="about"
        lang={lang}
        ref={aboutRef}
        style={{ opacity }}
      >
        {/* 入场动画放内层，避免其 fill 锁住 opacity 覆盖外层滚动 opacity */}
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {title}
          </motion.h1>
          {paragraphs.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
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
      title={lang === 'en' ? '更改语言 / Change language' : '更改语言 / Change language'}
    >
      <span className="lang-toggle-glyph" aria-hidden="true">Aあ</span>
      <span className="lang-toggle-text">{lang === 'en' ? '语言' : 'Language'}</span>
    </button>
  )
}

export default function App() {
  const stored = readStoredLang()
  const [lang, setLang] = useState<Lang>(stored ?? 'zh')
  // 首次访问（localStorage 无记录）才弹语言门；记住选择后默认不再弹。
  const [showGate, setShowGate] = useState<boolean>(stored === null)
  const [modelReady, setModelReady] = useState(false)
  const handleModelReady = useCallback(() => setModelReady(true), [])
  const { scrollY } = useScroll()

  // 首屏强制顶部：修复刷新 / 带旧 hash 深链导致的「自动跳到底部」Bug。
  // 与 PROJECT NOVA Case Study 的 savedY 自恢复无关（那套是显式 JS 控制，不会受影响）。
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // 语言门开启期间锁顶：背后 3D 继续并行加载，但 Portfolio 内容不可滚动。
  useEffect(() => {
    if (showGate) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showGate])

  // 选择语言 = 以 HOME/Hero 顶部重新进入（即便 3D 未就绪，Hero 文本/背景会先出现）。
  const chooseLang = (l: Lang) => {
    try {
      localStorage.setItem(LS_LANG, l)
    } catch {
      /* 忽略隐私模式下的写入失败 */
    }
    setLang(l)
    setShowGate(false)
    window.scrollTo(0, 0)
  }

  // 「更改语言」入口：重新打开语言门，同样锁顶并落到 Hero。
  const openGate = () => {
    window.scrollTo(0, 0)
    setShowGate(true)
  }
  // 作品区蒙层：以作品区顶部从视口底进入到视口中部的进度，驱动 3D 渐暗 + 模糊
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(244, 239, 247, 0)', 'rgba(232, 225, 239, 0.26)']
  )
  const fogBlur = useTransform(worksProgress, [0, 1], ['blur(0px)', 'blur(10px)'])
  // 滚动渐暗：离开首屏后压暗 3D 场景，保证履历文字可读
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.12])
  // 首屏滚动提示随之淡出
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // 首屏底部渐变底色：开始滑动后淡出
  const heroGradientOpacity = useTransform(scrollY, [0, 240], [1, 0])
  // 磨砂右轨：进入履历区后淡入（首屏不磨砂）
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // 首屏装饰画框/角标：滚动后淡出
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      {/* 加载遮罩：模型全部加载完成前覆盖全屏，完成后淡出 */}
      <LoadingScreen ready={modelReady} />

      {/* 固定的 3D 背景 */}
      <SceneBackground modelReady={modelReady} onModelReady={handleModelReady} />

      {/* 滚动渐暗蒙层 */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* 作品区固定蒙层：仅压暗（减半），模糊先注释掉 */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg /* , backdropFilter: fogBlur, WebkitBackdropFilter: fogBlur */ }}
        aria-hidden="true"
      />

      {/* 固定磨砂右轨（进入履历区淡入） */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* 首屏底部渐变底色，滚动后淡出 —— 暂时注释查看效果 */}
      {/* <motion.div
        className="hero-gradient"
        style={{ opacity: heroGradientOpacity }}
        aria-hidden="true"
      /> */}

      {/* 语言门：首次访问或「更改语言」时显示，覆盖在加载遮罩之上；3D 在背后并行加载 */}
      {showGate && <LanguageGate onChoose={chooseLang} />}

      {/* 记住语言后的常驻「更改语言」入口（不强制每次刷新都弹） */}
      {!showGate && <LangToggle lang={lang} onToggle={openGate} />}

      {/* 首屏装饰：发丝内框 + 四角定位标 + 角标元数据（随滚动淡出） */}
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

      {/* 全屏胶片噪点蒙层（multiply 混合） */}
      <NoiseOverlay />

      {/* 可滚动内容 */}
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
