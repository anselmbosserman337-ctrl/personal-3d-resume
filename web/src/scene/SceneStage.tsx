import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Scene from './Scene'
import { useStore } from '../store'

// Code-split host for the WebGL scene. Imported lazily from App so the heavy
// three / @react-three / postprocessing payload stays out of the initial bundle
// and the Language Gate can paint immediately. The character GLB + HDR were
// already warmed (HTTP cache) by preloadCriticalAssets() at boot, so this chunk
// decodes instead of re-downloading.

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

export default function SceneStage({
  modelReady,
  onModelReady,
}: {
  modelReady: boolean
  onModelReady: () => void
}) {
  // 全屏浮层（作品详情等）打开时暂停渲染：
  // 1) 浮层带全屏 backdrop-filter 模糊，背后 3D 每帧变化会强制整屏重新模糊，代价极高；
  // 2) 把 GPU / 主线程完全让给浮层的入场动画与滚动，消除「点击查看详情」的卡顿。
  const overlayOpen = useStore((s) => s.overlayOpen)

  return (
    <>
      <div className="scene-bg">
        <Canvas
          frameloop={overlayOpen ? 'never' : 'always'}
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
      {/* 模型全部加载完成前覆盖一层淡淡的环境色，完成后平滑淡出（即人物 fade-in） */}
      <div className={`scene-loading-wash${modelReady ? ' is-hidden' : ''}`} aria-hidden="true" />
    </>
  )
}
