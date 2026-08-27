import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { CONTACT } from '../data/contact'

type Lang = 'en' | 'zh'

const COPY = {
  zh: {
    eyebrow: 'CONTACT',
    title: '联系我',
    subtitle: '欢迎就学习、项目与合作与我交流。',
    phone: '手机号',
    qq: 'QQ',
    gmail: 'Gmail',
    reveal: '显示',
    hide: '隐藏',
    copy: '复制',
    copied: '已复制',
    print: '保存 / 打印 PDF',
  },
  en: {
    eyebrow: 'CONTACT',
    title: "Let's Connect",
    subtitle: 'Feel free to reach out about study, projects, and collaboration.',
    phone: 'Phone',
    qq: 'QQ',
    gmail: 'Gmail',
    reveal: 'Reveal',
    hide: 'Hide',
    copy: 'Copy',
    copied: 'Copied',
    print: 'Save / Print PDF',
  },
} as const

const EASE = [0.22, 1, 0.36, 1]

// 复制文本：优先 Clipboard API（需安全上下文），失败回退到 textarea + execCommand
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* 回退 */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.focus()
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

export default function Contact({ lang }: { lang: Lang }) {
  const copy = COPY[lang]
  const [revealed, setRevealed] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = useCallback(async (key: string, value: string) => {
    const ok = await copyText(value)
    if (ok) {
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600)
    }
  }, [])

  const handlePrint = () => window.print()

  return (
    <section className={`contact${revealed ? ' is-revealed' : ''}`} id="contact" lang={lang}>
      <div className="contact-inner">
        <motion.header
          className="contact-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="contact-eyebrow">{copy.eyebrow}</span>
          <h2 className="contact-title">{copy.title}</h2>
          <p className="contact-sub">{copy.subtitle}</p>
        </motion.header>

        <motion.div
          className="contact-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* ── PHONE ── */}
          <div className="contact-row">
            <span className="contact-label">{copy.phone}</span>
            <span className="contact-value">
              <span className="contact-phone-masked">{CONTACT.phone.masked}</span>
              <span className="contact-phone-full">{CONTACT.phone.full}</span>
            </span>
            <span className="contact-actions">
              <button
                type="button"
                className="contact-btn contact-reveal"
                onClick={() => setRevealed((v) => !v)}
                aria-pressed={revealed}
              >
                {revealed ? copy.hide : copy.reveal}
              </button>
              <button
                type="button"
                className="contact-btn contact-copy"
                onClick={() => handleCopy('phone', CONTACT.phone.full)}
              >
                {copiedKey === 'phone' ? copy.copied : copy.copy}
              </button>
            </span>
          </div>

          {/* ── QQ ── */}
          <div className="contact-row">
            <span className="contact-label">{copy.qq}</span>
            <span className="contact-value">{CONTACT.qq.full}</span>
            <span className="contact-actions">
              <button
                type="button"
                className="contact-btn contact-copy"
                onClick={() => handleCopy('qq', CONTACT.qq.full)}
              >
                {copiedKey === 'qq' ? copy.copied : copy.copy}
              </button>
            </span>
          </div>

          {/* ── GMAIL ── */}
          <div className="contact-row">
            <span className="contact-label">{copy.gmail}</span>
            <span className="contact-value">
              <a className="contact-mail" href={`mailto:${CONTACT.gmail.full}`}>
                {CONTACT.gmail.full}
              </a>
            </span>
            <span className="contact-actions">
              <button
                type="button"
                className="contact-btn contact-copy"
                onClick={() => handleCopy('gmail', CONTACT.gmail.full)}
              >
                {copiedKey === 'gmail' ? copy.copied : copy.copy}
              </button>
            </span>
          </div>

          {/* ── PRINT / SAVE PDF ── */}
          <div className="contact-print-row">
            <button type="button" className="contact-btn contact-print" onClick={handlePrint}>
              {copy.print}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
