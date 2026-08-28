import { useRef } from 'react'
import { useProgress } from '@react-three/drei'

// 全屏加载遮罩：读取 three LoadingManager 进度（useProgress），
// 圆环仍展示 LoadingManager 的总体进度，但显隐由实际 GLB ready 信号驱动。
// 纯动态 UI：随真实进度填充的旋转圆环，无文字。
// 用 CSS 过渡 + setTimeout 控制淡出/卸载（不依赖 rAF，后台/离屏也可靠）。
export default function LoadingScreen({ ready }: { ready: boolean }) {
  const { progress } = useProgress()
  // 记录最高进度，防止分批注册资源时圆环回缩
  const peak = useRef(0)
  peak.current = Math.max(peak.current, Math.min(Math.max(progress, 0), 100))

  const R = 34
  const C = 2 * Math.PI * R
  const offset = C * (1 - peak.current / 100)

  return (
    <div className={`loading-screen${ready ? ' is-hidden' : ''}`} aria-hidden="true">
      <div className="loading-ring">
        <svg viewBox="0 0 80 80">
          <circle className="lr-track" cx="40" cy="40" r={R} />
          <circle
            className="lr-arc"
            cx="40"
            cy="40"
            r={R}
            style={{ strokeDasharray: C, strokeDashoffset: offset }}
          />
        </svg>
      </div>
    </div>
  )
}
