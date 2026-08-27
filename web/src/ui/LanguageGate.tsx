import { useEffect, useRef } from 'react'

type Lang = 'en' | 'zh'

// 全屏「数字手账封面」语言选择门：
// - 轻量纯 HTML/CSS，不加载任何图片 / WebGL / 新依赖，几乎即时出现，且不等待 3D 模型。
// - 与 3D 加载并行：门显示期间，背景的 glb / Meshopt 解码 / HDR 场景继续在后台初始化。
// - 真实 <button>，清晰文字「中文 / English」，首屏聚焦第一个按钮；ESC 不关闭（必须选择）。
// - 门只是 UI 层，绝不重新初始化 / 销毁 Three.js 场景。
export default function LanguageGate({ onChoose }: { onChoose: (lang: Lang) => void }) {
  const zhRef = useRef<HTMLButtonElement>(null)

  // 打开时把焦点放到第一个语言按钮，方便键盘用户
  useEffect(() => {
    zhRef.current?.focus()
  }, [])

  return (
    <div className="lang-gate" role="dialog" aria-modal="true" aria-labelledby="lg-title">
      <div className="lang-gate-journal">
        <span className="lang-gate-tape" aria-hidden="true" />
        <p className="lang-gate-kicker">PORTFOLIO · 2026</p>
        <h1 className="lang-gate-title" id="lg-title">
          选择语言
        </h1>
        <p className="lang-gate-sub">欢迎来到乔思萌的数字作品集 · Welcome to the digital journal</p>

        <div className="lang-gate-buttons">
          <button
            ref={zhRef}
            type="button"
            className="lang-gate-btn is-zh"
            onClick={() => onChoose('zh')}
          >
            <span className="lg-btn-main">中文</span>
            <span className="lg-btn-sub">简体中文</span>
          </button>
          <button
            type="button"
            className="lang-gate-btn is-en"
            onClick={() => onChoose('en')}
          >
            <span className="lg-btn-main">English</span>
            <span className="lg-btn-sub">English</span>
          </button>
        </div>

        <p className="lang-gate-hint" aria-hidden="true">
          选择后将从首页顶部进入 · Choose to enter from the top
        </p>
      </div>
    </div>
  )
}
