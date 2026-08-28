import { useEffect, useRef } from 'react'

type Lang = 'en' | 'zh'

// 全屏「数字手账封面」语言选择门：
// - 轻量纯 HTML/CSS，不加载任何图片 / WebGL / 新依赖，几乎即时出现，且不等待 3D 模型。
// - 与 3D 加载并行：门显示期间，背景的 glb / Meshopt 解码 / HDR 场景继续在后台初始化。
// - 真实 <button>，清晰文字「中文 / English」，首屏聚焦第一个按钮；ESC 不关闭（必须选择）。
// - 门只是 UI 层，绝不重新初始化 / 销毁 Three.js 场景。
// - 点选后：被点按钮约 300–450ms 确认反馈（is-confirming）→ 数字手帐翻页（is-turning）。
//   翻页全程纯 CSS transform/opacity，零新资源；翻页期间极短暂显示一句状态文案（无 % / MB / 技术名词）。
export default function LanguageGate({
  onChoose,
  confirming,
  turning,
  lang,
}: {
  onChoose: (lang: Lang) => void
  confirming: Lang | null
  turning: boolean
  lang: Lang
}) {
  const zhRef = useRef<HTMLButtonElement>(null)

  // 打开时把焦点放到第一个语言按钮，方便键盘用户
  useEffect(() => {
    zhRef.current?.focus()
  }, [])

  // 翻页期间的极短暂状态文案：仅一句，随当前所选语言切换；不阻塞、不拖延。
  const openingText = lang === 'en' ? 'Opening the scrapbook…' : '正在翻开这本数字手帐…'

  return (
    <div
      className={`lang-gate${turning ? ' is-turning' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lg-title"
    >
      <div className="lang-gate-journal">
        <span className="lang-gate-tape" aria-hidden="true" />
        <p className="lang-gate-kicker">PORTFOLIO · 2026</p>
        <h1 className="lang-gate-title" id="lg-title">
          选择语言
        </h1>
        <p className="lang-gate-sub">欢迎来到乔思萌的数字作品集 · Welcome to the digital journal</p>

        <div className="lang-gate-tip" role="note">
          <span className="lg-tip-label">温馨提示</span>
          <span className="lg-tip-text">
            您好！本网站使用了 3D 建模技术，并带有随页面滚动播放的人物动画，每个动画的镜头切换都对应相应的贴纸与介绍内容。由于内容较多，网页打开可能较慢，若加载卡顿可刷新重试。
          </span>
          <span className="lg-tip-text-en">
            Hello! This site uses 3D modeling and features character animations that play as you scroll. Each
            scene's camera movement corresponds to its matching stickers and descriptions. With so much content,
            the page may load slowly — feel free to refresh if it stalls.
          </span>
        </div>

        <div className="lang-gate-buttons">
          <button
            ref={zhRef}
            type="button"
            className={`lang-gate-btn is-zh${confirming === 'zh' ? ' is-confirming' : ''}`}
            onClick={() => onChoose('zh')}
            disabled={turning}
            aria-pressed={confirming === 'zh'}
          >
            <span className="lg-btn-main">中文</span>
            <span className="lg-btn-sub">简体中文</span>
          </button>
          <button
            type="button"
            className={`lang-gate-btn is-en${confirming === 'en' ? ' is-confirming' : ''}`}
            onClick={() => onChoose('en')}
            disabled={turning}
            aria-pressed={confirming === 'en'}
          >
            <span className="lg-btn-main">English</span>
            <span className="lg-btn-sub">English</span>
          </button>
        </div>

        {/* 翻页期间极短暂显示（prefers-reduced-motion 下同样只是淡入，不旋转）。
            非翻页时保持不可见、不占高度，避免首屏留白。 */}
        <p
          className={`lang-gate-opening${turning ? ' is-shown' : ''}`}
          aria-hidden={turning ? undefined : true}
        >
          {openingText}
        </p>

        <p className="lang-gate-hint" aria-hidden="true">
          选择后将从首页顶部进入 · Choose to enter from the top
        </p>
      </div>
    </div>
  )
}
