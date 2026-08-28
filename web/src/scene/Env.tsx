import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import * as THREE from 'three'
import { markCriticalResourceError, markCriticalResourceReady } from '../preloadAssets'

const ENV_URL = `${import.meta.env.BASE_URL}textures/env_lite.hdr`
const ENV_FALLBACK_URL = `${import.meta.env.BASE_URL}textures/env.hdr`

const loadTexture = (url: string) =>
  new Promise<THREE.DataTexture>((resolve, reject) => {
    new RGBELoader().load(url, resolve, undefined, reject)
  })

// Start one shared download/decode during module evaluation. The mounted
// component consumes this exact texture, avoiding a second RGBE decode.
const environmentTexturePromise = loadTexture(ENV_URL).catch(() => loadTexture(ENV_FALLBACK_URL))

// env.hdr 作为光照 / 反射环境（IBL），并可选作为可见背景（替代 Sky.jsx 天空球）。
// three r163+ 原生支持 scene.environmentRotation / scene.backgroundRotation。
export default function Env({
  intensity,
  rotationX,
  rotationY,
  rotationZ,
  asBackground,
  bgIntensity,
  bgBlur,
}: {
  intensity: number
  rotationX: number
  rotationY: number
  rotationZ: number
  asBackground: boolean
  bgIntensity: number
  bgBlur: number
}) {
  const scene = useThree((s) => s.scene)
  const [texture, setTexture] = useState<THREE.DataTexture | null>(null)
  const environmentBlend = useRef(0)

  // Keep the original HDR as an automatic runtime fallback. RGBELoader uses
  // Three's DefaultLoadingManager, so the progress indicator remains accurate.
  useEffect(() => {
    let cancelled = false
    let loadedTexture: THREE.DataTexture | null = null
    const accept = (nextTexture: THREE.DataTexture) => {
      if (cancelled) {
        nextTexture.dispose()
        return
      }
      loadedTexture = nextTexture
      setTexture(nextTexture)
    }
    environmentTexturePromise.then(accept).catch((error) => {
      markCriticalResourceError('environment', error)
    })
    return () => {
      cancelled = true
      loadedTexture?.dispose()
    }
  }, [])

  // 记录接管前的背景（App.jsx 里设的深色），关闭 asBackground 时恢复。
  const initialBg = useRef<any>(null)
  useEffect(() => {
    initialBg.current = scene.background
  }, [scene])

  // 作为光照/反射环境
  useLayoutEffect(() => {
    if (!texture) return
    texture.mapping = THREE.EquirectangularReflectionMapping
    environmentBlend.current = 0
    scene.environmentIntensity = 0
    scene.environment = texture
    markCriticalResourceReady('environment')
    return () => {
      scene.environment = null
      scene.environmentIntensity = 0
    }
  }, [scene, texture])

  // Cross-fade IBL after the texture resolves. The model is already visible
  // under the unchanged hemisphere/directional fallback lights, so HDR never
  // blocks it and never causes a one-frame exposure jump.
  useFrame((_, delta) => {
    environmentBlend.current = THREE.MathUtils.damp(environmentBlend.current, 1, 4.5, delta)
    scene.environmentIntensity = intensity * environmentBlend.current
  })

  // 旋转：同一组欧拉角(度→弧度)同时驱动环境反射与背景朝向
  useEffect(() => {
    if (!texture) return
    const x = THREE.MathUtils.degToRad(rotationX)
    const y = THREE.MathUtils.degToRad(rotationY)
    const z = THREE.MathUtils.degToRad(rotationZ)
    scene.environmentRotation.set(x, y, z)
    scene.backgroundRotation.set(x, y, z)
  }, [scene, texture, rotationX, rotationY, rotationZ])

  // 作为可见背景
  useEffect(() => {
    if (!texture) return
    scene.background = asBackground ? texture : initialBg.current
    return () => {
      scene.background = initialBg.current
    }
  }, [scene, texture, asBackground])

  // 背景曝光控制：backgroundIntensity 只缩放背景显示亮度，不影响场景受光；
  // backgroundBlurriness 柔化背景、削弱刺眼高光。
  useEffect(() => {
    scene.backgroundIntensity = bgIntensity
    scene.backgroundBlurriness = bgBlur
  }, [scene, bgIntensity, bgBlur])

  return null
}
