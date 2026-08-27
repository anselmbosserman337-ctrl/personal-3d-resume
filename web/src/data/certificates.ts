export type Language = 'zh' | 'en'

export interface Certificate {
  id: string
  title: Record<Language, string>
  issuer: string
  category: Record<Language, string>
  date?: Record<Language, string>
  thumbnail: string
  original: string
  featured?: boolean
  layout?: 'wide' | 'standard'
}

const base = import.meta.env.BASE_URL

// Array order is the gallery order. Reorder these records to change the page order.
export const CERTIFICATES: Certificate[] = [
  {
    id: 'alibaba-cloud-clouder',
    title: { zh: '阿里云 Apsara Clouder 专项技能认证', en: 'Alibaba Cloud Apsara Clouder' },
    issuer: 'Alibaba Cloud',
    category: { zh: '大模型 · 智能体', en: 'LLM · Agent' },
    date: { zh: '有效至 2028.08.01', en: 'Valid through 2028.08.01' },
    thumbnail: `${base}certificates/thumbs/certificate-alibaba-cloud-clouder.webp`,
    original: `${base}certificates/originals/certificate-alibaba-cloud-clouder.png`,
    featured: true,
    layout: 'wide',
  },
  {
    id: 'agent-engineer-ant',
    title: { zh: 'Agent Engineer', en: 'Agent Engineer' },
    issuer: 'Datawhale × Ant Group × 百宝箱',
    category: { zh: '智能体工程', en: 'Agent Engineering' },
    date: { zh: '2026 年 8 月', en: 'August 2026' },
    thumbnail: `${base}certificates/thumbs/certificate-agent-engineer-ant.webp`,
    original: `${base}certificates/originals/certificate-agent-engineer-ant.png`,
    featured: true,
  },
  {
    id: 'llm-development-datawhale',
    title: { zh: '大模型开发工程师', en: 'Large Language Model Development Engineer' },
    issuer: 'Datawhale',
    category: { zh: '大模型开发', en: 'LLM Development' },
    thumbnail: `${base}certificates/thumbs/certificate-llm-development-datawhale.webp`,
    original: `${base}certificates/originals/certificate-llm-development-datawhale.png`,
    featured: true,
  },
  {
    id: 'llm-engineer-virtai',
    title: { zh: 'LLM Engineer', en: 'LLM Engineer' },
    issuer: 'Datawhale × VirtAI Cloud × HAAI',
    category: { zh: '大模型开发', en: 'LLM Development' },
    thumbnail: `${base}certificates/thumbs/certificate-llm-engineer-virtai.webp`,
    original: `${base}certificates/originals/certificate-llm-engineer-virtai.png`,
  },
  {
    id: 'ai-coding-marscode',
    title: { zh: 'AI+编程能力认证', en: 'AI + Programming Certification' },
    issuer: 'Datawhale × MarsCode',
    category: { zh: 'AI 编程', en: 'AI Programming' },
    date: { zh: '2026.08.26', en: '2026.08.26' },
    thumbnail: `${base}certificates/thumbs/certificate-ai-coding-marscode.webp`,
    original: `${base}certificates/originals/certificate-ai-coding-marscode.png`,
  },
  {
    id: 'ai4s-python',
    title: { zh: 'AI4S Cup - Python 基础能力认证', en: 'AI4S Cup - Python Foundation' },
    issuer: '北京科学智能研究院 × 深势科技',
    category: { zh: 'Python · AI for Science', en: 'Python · AI for Science' },
    date: { zh: '2026.08.26', en: '2026.08.26' },
    thumbnail: `${base}certificates/thumbs/certificate-ai4s-python.webp`,
    original: `${base}certificates/originals/certificate-ai4s-python.png`,
  },
  {
    id: 'prompt-engineer-iflytek',
    title: { zh: 'Prompt 工程师认证', en: 'Prompt Engineer Certification' },
    issuer: '科大讯飞 AI 大学堂',
    category: { zh: '提示词工程', en: 'Prompt Engineering' },
    date: { zh: '有效至 2028.08.26', en: 'Valid through 2028.08.26' },
    thumbnail: `${base}certificates/thumbs/certificate-prompt-engineer-iflytek.webp`,
    original: `${base}certificates/originals/certificate-prompt-engineer-iflytek.png`,
  },
  {
    id: 'finetuning-engineer',
    title: { zh: '微调工程师认证', en: 'Fine-tuning Engineer Certification' },
    issuer: '科大讯飞 AI 大学堂',
    category: { zh: '大模型微调', en: 'LLM Fine-tuning' },
    date: { zh: '有效至 2028.08.26', en: 'Valid through 2028.08.26' },
    thumbnail: `${base}certificates/thumbs/certificate-finetuning-engineer.webp`,
    original: `${base}certificates/originals/certificate-finetuning-engineer.png`,
  },
  {
    id: 'agent-engineer-iflytek',
    title: { zh: '智能体工程师认证', en: 'Agent Engineer Certification' },
    issuer: '科大讯飞 AI 大学堂',
    category: { zh: '智能体工程', en: 'Agent Engineering' },
    date: { zh: '有效至 2028.08.26', en: 'Valid through 2028.08.26' },
    thumbnail: `${base}certificates/thumbs/certificate-agent-engineer-iflytek.webp`,
    original: `${base}certificates/originals/certificate-agent-engineer-iflytek.png`,
  },
  {
    id: 'prompt-engineer-spark',
    title: { zh: 'Prompt Engineer', en: 'Prompt Engineer' },
    issuer: 'Datawhale × 讯飞星火',
    category: { zh: '提示词工程', en: 'Prompt Engineering' },
    thumbnail: `${base}certificates/thumbs/certificate-prompt-engineer-spark.webp`,
    original: `${base}certificates/originals/certificate-prompt-engineer-spark.png`,
  },
  {
    id: 'huawei-ai-fundamentals',
    title: { zh: '人工智能初识微认证', en: 'AI Fundamentals Micro Certification' },
    issuer: 'Huawei',
    category: { zh: 'AI 基础', en: 'AI Foundations' },
    date: { zh: '有效至 2028.08.25', en: 'Valid through 2028.08.25' },
    thumbnail: `${base}certificates/thumbs/certificate-huawei-ai-fundamentals.webp`,
    original: `${base}certificates/originals/certificate-huawei-ai-fundamentals.png`,
  },
]
