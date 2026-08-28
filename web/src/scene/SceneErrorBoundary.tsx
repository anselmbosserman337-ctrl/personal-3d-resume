import { Component, type ErrorInfo, type ReactNode } from 'react'

export default class SceneErrorBoundary extends Component<
  { children: ReactNode; onError: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[scene] Critical WebGL scene failed', error, info)
    this.props.onError(error)
  }

  render() {
    if (this.state.failed) {
      // Keep the established CSS scrapbook background as a readable, stable
      // Hero fallback. No retry/cancellation is forced on other resources.
      return <div className="scene-bg scene-bg-fallback" aria-hidden="true" />
    }
    return this.props.children
  }
}
