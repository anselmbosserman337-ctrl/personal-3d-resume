import { lazy, Suspense, useEffect, useRef, useState, type Ref } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { WORKS, SECTION_COVERS, type WorkListItem, type WorkSection, type WorksLang } from '../data/works'
import { projectNova } from '../data/projectNova'
import { useStore } from '../store'

// 详情 chunk 内含 react-markdown，体积较大（~322KB）。若等到点击时才 import，
// 会经历「下载 → 解析 → 执行」的空窗期，而 Suspense fallback 是 null（画面零反馈），
// 主观感受就是「点了没反应 / 卡顿」。把 import thunk 抽出来复用：
// 悬停 / 聚焦任一作品条目、或板块进入视口后的空闲时段就提前拉取，点击时模块已在内存中。
const importCaseStudy = () => import('./CaseStudy')
const importWorkDetail = () => import('./WorkDetail')
const CaseStudy = lazy(importCaseStudy)
const WorkDetail = lazy(importWorkDetail)

let detailsWarmed = false
function warmDetails() {
  if (detailsWarmed) return
  detailsWarmed = true
  void importWorkDetail()
  void importCaseStudy()
}

// chunk 尚未就绪时的兜底：立刻铺一层暗底，让点击「即时有反馈」，
// 避免出现毫无响应的空窗期。正常网络下已被上面的预热消除，几乎不会露面。
function DetailFallback() {
  return <div className="wk-detail-tap" aria-hidden="true" />
}

function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null)
  const [isNear, setIsNear] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || isNear) return
    if (!('IntersectionObserver' in window)) {
      setIsNear(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNear(true)
        observer.disconnect()
      },
      { rootMargin: '800px 35%' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [isNear])

  return { ref, isNear }
}

// 极简清单的一行：作品名靠左、数据(播放量/标签)靠右、发丝线分隔；整行可点开全屏详情
function WorkLine({
  item,
  onOpen,
  onWarm,
}: {
  item: WorkListItem
  onOpen: (item: WorkListItem) => void
  onWarm: () => void
}) {
  const hasMeta = item.meta || (item.tags && item.tags.length)
  return (
    <li className="wk-line">
      {/* 悬停 / 键盘聚焦即预热详情 chunk：点击前模块已就绪，点击后即时渲染 */}
      <button
        className="wk-line-btn"
        onClick={() => onOpen(item)}
        onPointerEnter={onWarm}
        onFocus={onWarm}
      >
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
          </span>
        )}
      </button>
    </li>
  )
}

// 一张全高板块卡：左侧整高配图，右侧文字（编号 + 标题 + 清单）
function SectionCard({
  section,
  data,
  onOpen,
  onWarm,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
  onWarm: () => void
}) {
  const [coverError, setCoverError] = useState(false)
  const cover = SECTION_COVERS[section.id]
  const { ref: coverRef, isNear } = useNearViewport<HTMLButtonElement>()
  // 封面代表整个板块：点击封面 = 打开该板块首个作品的详情（与右侧清单项一致）
  const coverItem: WorkListItem | null =
    section.items?.[0] ??
    (section.groups?.[0] ? { name: section.groups[0].items[0] } : null)
  return (
    <div className="wk-card">
      <div className="wk-card-head">
        <span className="wk-card-no">{section.no}</span>
        <h3 className="wk-card-title">{section.title}</h3>
        <span className="wk-card-tagline">{section.tagline}</span>
      </div>
      <div className="wk-card-cover-wrap">
        <button
          ref={coverRef}
          type="button"
          className="wk-card-cover"
          onClick={() => coverItem && onOpen(coverItem)}
          onPointerEnter={onWarm}
          onFocus={onWarm}
          aria-label={data.coverHint}
        >
          {cover && isNear && !coverError ? (
            <img src={cover} alt="" loading="lazy" decoding="async" onError={() => setCoverError(true)} />
          ) : (
            <div className="wk-card-cover-ph" aria-hidden="true">
              <span className="wk-card-cover-no">{section.no}</span>
            </div>
          )}
        </button>
        <p className="wk-card-cover-cap">{data.coverHint}</p>
      </div>
      <SectionWorks section={section} data={data} onOpen={onOpen} onWarm={onWarm} />
    </div>
  )
}

// 板块内的作品清单（items 扁平 / groups 分组 / awards · footer 底部小字）
function SectionWorks({
  section,
  data,
  onOpen,
  onWarm,
}: {
  section: WorkSection
  data: WorksLang
  onOpen: (item: WorkListItem) => void
  onWarm: () => void
}) {
  return (
    <div className="wk-card-body">
      {section.items && (
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} onOpen={onOpen} onWarm={onWarm} />
          ))}
        </ul>
      )}

      {section.groups &&
        section.groups.map((g, gi) => (
          <div key={gi} className="wk-sub">
            <div className="wk-sub-head">{g.heading}</div>
            <ul className="wk-list">
              {g.items.map((it, i) => (
                <WorkLine key={i} item={{ name: it }} onOpen={onOpen} onWarm={onWarm} />
              ))}
            </ul>
          </div>
        ))}

      {(section.awards || section.footer) && (
        <div className="wk-foot">
          {section.awards && (
            <p className="wk-foot-line">
              <span className="wk-foot-label">{data.awardsLabel}</span>
              <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
            </p>
          )}
          {section.footer && <p className="wk-foot-line">{section.footer}</p>}
        </div>
      )}
    </div>
  )
}

export default function Works({ lang, innerRef }: { lang: 'en' | 'zh'; innerRef: Ref<HTMLElement> }) {
  const data = WORKS[lang]
  const sections = data.sections
  const count = sections.length

  const [active, setActive] = useState<WorkListItem | null>(null) // 当前打开详情的作品 item
  const setOverlayOpen = useStore((s) => s.setOverlayOpen)

  // 空闲时段提前拉取详情 chunk：用户滚到 Works 时模块已就绪，点击即为同步渲染。
  // 与「悬停预热」互为兜底（触摸设备没有 hover，靠这条保证不卡）。
  useEffect(() => {
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback
    if (idle) {
      const id = idle(() => warmDetails(), { timeout: 2500 })
      return () => {
        const cancel = (window as unknown as { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback
        cancel?.(id)
      }
    }
    const t = window.setTimeout(warmDetails, 1800)
    return () => window.clearTimeout(t)
  }, [])

  // 竖滚 pin 转横移：测量整排卡片的实际可横移距离（px），竖滚进度 → 横移
  const galleryRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start start', 'end end'],
  })

  // track 实际宽度 - 视口宽 = 需要横移的距离；随尺寸/语言变化重测
  const [scrollRange, setScrollRange] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setScrollRange(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [count, lang])

  // px 数值插值（比 vw 字符串更顺）；竖滚行程与横移 1:1
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  // 横移到底时「继续下滑」提示渐隐
  const hintOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])

  // 详情打开：锁滚动 + ESC 关闭 + 保存/恢复位置，并在浮层期间暂停 3D
  useEffect(() => {
    if (!active) {
      // 关闭：等退场动画播完再恢复 3D，否则退场期间两者仍抢 GPU
      const t = window.setTimeout(() => setOverlayOpen(false), 460)
      return () => window.clearTimeout(t)
    }

    setOverlayOpen(true)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    const prevPadRight = document.body.style.paddingRight
    const savedY = window.scrollY
    // 锁滚动会让滚动条消失 → 视口变宽 → 触发 resize / ResizeObserver 重测横移距离 →
    // framer-motion 的 pin 横移重算，这是点击瞬间画面抖动的一大来源。补上滚动条宽度即可消除。
    const sbw = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPadRight
      window.scrollTo(0, savedY)
    }
  }, [active, setOverlayOpen])

  return (
    <section className="works" id="works" lang={lang} ref={innerRef}>
      <div
        className="wk-gallery"
        ref={galleryRef}
        style={{ height: `calc(100vh + ${scrollRange}px)` }}
      >
        <div className="wk-gallery-sticky">
          <span className="wk-gallery-title">{data.title}</span>

          <motion.div className="wk-track" ref={trackRef} style={{ x }}>
            {sections.map((s) => (
              <SectionCard key={s.id} section={s} data={data} onOpen={setActive} onWarm={warmDetails} />
            ))}
          </motion.div>

          <div className="wk-progress" aria-hidden="true">
            <motion.div className="wk-progress-fill" style={{ scaleX: scrollYProgress }} />
          </div>
          <motion.span className="wk-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            {data.hint}
          </motion.span>
        </div>
      </div>

      {/* ── 打印专用：PROJECT NOVA 摘要（屏幕隐藏，@media print 显示）── */}
      <div className="nova-print" aria-hidden="true">
        <h3 className="nova-print-title">{projectNova.name}</h3>
        <p className="nova-print-cat">{projectNova.category}</p>
        <div className="nova-print-meta">
          <span>
            <b>Type</b> {projectNova.type}
          </span>
          <span>
            <b>Period</b> {projectNova.period}
          </span>
          <span>
            <b>Role</b> {projectNova.role.join(' · ')}
          </span>
        </div>
        <div className="nova-print-tech">
          {projectNova.techStack.map((t) => (
            <span key={t.name} className="nova-print-tech-item">
              {t.name}
            </span>
          ))}
        </div>
        <p className="nova-print-brief">{projectNova.resultText[0]}</p>
      </div>

      <Suspense fallback={<DetailFallback />}>
        <AnimatePresence>
          {active &&
            (active.slug === 'project-nova' ? (
              <CaseStudy key="project-nova" onClose={() => setActive(null)} />
            ) : (
              <WorkDetail
                key={active.slug || active.name}
                item={active}
                data={data}
                onClose={() => setActive(null)}
              />
            ))}
        </AnimatePresence>
      </Suspense>
    </section>
  )
}
