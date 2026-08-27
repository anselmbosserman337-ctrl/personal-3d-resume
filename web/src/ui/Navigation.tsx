import { useEffect, useRef, useState } from 'react'

type NavItem = { id: string; label: string }

const ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'resume', label: 'Resume' },
  { id: 'skills', label: 'Skills' },
  { id: 'works', label: 'Works' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'contact', label: 'Contact' },
]

const NAV_OFFSET = 72 // 与 scroll-margin-top 对齐，避免被固定导航遮挡

export default function Navigation() {
  const [activeId, setActiveId] = useState('home')
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const activeRef = useRef('home')
  const innerRef = useRef<HTMLDivElement>(null)

  // —— Scroll Spy：IntersectionObserver，轻量、不触发高频 re-render ——
  useEffect(() => {
    const sections = ITEMS.map((item) => document.getElementById(item.id)).filter(
      (el): el is HTMLElement => el !== null
    )

    const computeActive = () => {
      const line = window.innerHeight * 0.35
      let current = sections[0]?.id ?? 'home'
      // 取“顶部已越过参考线”的最后一个 section，避免交界处闪烁
      for (const el of sections) {
        if (el.getBoundingClientRect().top - line <= 0) current = el.id
      }
      if (current !== activeRef.current) {
        activeRef.current = current
        setActiveId(current)
      }
    }

    const observer = new IntersectionObserver(() => computeActive(), {
      root: null,
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    })
    sections.forEach((el) => observer.observe(el))
    computeActive()
    return () => observer.disconnect()
  }, [])

  // —— 证书 Lightbox 打开时自动隐藏导航，保证 Lightbox 始终位于导航上方 ——
  useEffect(() => {
    const check = () => {
      const next = !!document.querySelector('.certificate-modal')
      setModalOpen((prev) => (prev === next ? prev : next))
    }
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])

  // —— 移动端：点击外部 / ESC 关闭菜单 ——
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onClick = (event: MouseEvent) => {
      if (innerRef.current && !innerRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open])

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // About 在 Hero 中随滚动淡出，落点略微偏下以保证可读；其余落点顶部对齐（避开导航）
      const offset = id === 'about' ? window.innerHeight * 0.45 : NAV_OFFSET
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset)
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
    }
    setOpen(false)
  }

  return (
    <nav
      className={`site-nav${modalOpen ? ' is-hidden' : ''}`}
      aria-label="Section navigation"
    >
      <div className="site-nav-inner" ref={innerRef}>
        <a className="site-nav-brand" href="#home" onClick={(e) => go(e, 'home')}>
          QS
        </a>

        <ul className="site-nav-list" id="primary-nav-menu">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <a
                className={`site-nav-link${activeId === item.id ? ' is-active' : ''}`}
                href={`#${item.id}`}
                onClick={(e) => go(e, item.id)}
                aria-current={activeId === item.id ? 'true' : undefined}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          className="site-nav-toggle"
          type="button"
          aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={open}
          aria-controls="primary-nav-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden="true">{open ? '×' : '☰'}</span>
        </button>
      </div>
    </nav>
  )
}
