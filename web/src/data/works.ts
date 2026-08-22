// 作品集数据（双语）。5 大板块 → 点击展开作品详情。
// 纯数据驱动：增删板块 / 作品只改本文件，Works.jsx 仅负责渲染。
//
// 板块字段：
//   id        唯一标识（用于 framer layoutId 共享元素动画）
//   no        编号 '01'…'05'
//   title     板块标题
//   tagline   索引行右侧一句话
//   items[]   扁平作品列表：{ name, meta?, tags?, link? }
//             点击 item 弹出全屏详情，可补充可选媒体/文案字段：
//             { image?, video?, year?, desc? }（缺省时媒体用占位、简介回退 meta/标签）
//   groups[]  分组作品（与 items 二选一）：{ heading, items: string[] }
//   awards[]  奖项 chip（可选）
//   footer    底部技术/备注一行（可选）

export interface WorkListItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading: string
  items: string[]
}

export interface WorkSection {
  id: string
  no: string
  title: string
  tagline: string
  items?: WorkListItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorksLang {
  title: string
  closeLabel: string
  openLabel: string
  hint: string
  awardsLabel: string
  visitLabel: string
  detailPlaceholder: string
  phImageLabel: string
  phButtonLabel: string
  countLabel: (n: number) => string
  sections: WorkSection[]
}

export const WORKS: Record<'zh' | 'en', WorksLang> = {
  zh: {
    title: 'Works',
    closeLabel: '返回',
    openLabel: '展开作品',
    hint: '继续下滑',
    awardsLabel: '获奖',
    visitLabel: '访问作品',
    detailPlaceholder: '学习与成长方向',
    phImageLabel: '图片 / 视频',
    phButtonLabel: '跳转按钮',
    countLabel: (n) => `${n} 件作品`,
    sections: [
      {
        id: 'economics',
        no: '01',
        title: '经济学学习',
        tagline: '从理论到现实问题',
        items: [
          { name: '经济学基础与数据思维', meta: '持续学习', tags: ['微观 / 宏观', '金融市场'], slug: 'economics-learning' },
        ],
      },
      {
        id: 'ai',
        no: '02',
        title: 'AI 探索',
        tagline: '把工具变成学习助力',
        items: [
          { name: 'AI 工具与应用实践', meta: '持续探索', tags: ['提示词', '效率工具'], slug: 'ai-exploration' },
        ],
      },
      {
        id: 'programming',
        no: '03',
        title: '编程学习',
        tagline: '从代码理解问题',
        items: [
          { name: 'C 语言与 Python', meta: '基础积累', tags: ['逻辑', '实践'], slug: 'programming-learning' },
        ],
      },
      {
        id: 'expression',
        no: '04',
        title: '表达与写作',
        tagline: '清晰传递想法',
        items: [
          { name: '写作、英语与沟通', meta: '持续积累', tags: ['结构化表达', '协作'], slug: 'expression-writing' },
        ],
      },
    ],
  },
  en: {
    title: 'Works',
    closeLabel: 'Back',
    openLabel: 'Explore',
    hint: 'Keep scrolling',
    awardsLabel: 'Awards',
    visitLabel: 'Visit site',
    detailPlaceholder: 'Learning and growth direction',
    phImageLabel: 'Image / Video',
    phButtonLabel: 'Link button',
    countLabel: (n) => `${n} works`,
    sections: [
      {
        id: 'economics',
        no: '01',
        title: 'Economics',
        tagline: 'From theory to real-world questions',
        items: [
          { name: 'Economic foundations & data thinking', meta: 'Learning', tags: ['Micro / Macro', 'Markets'], slug: 'economics-learning' },
        ],
      },
      {
        id: 'ai',
        no: '02',
        title: 'AI Exploration',
        tagline: 'Turning tools into learning support',
        items: [
          { name: 'AI tools & practical use', meta: 'Exploring', tags: ['Prompts', 'Productivity'], slug: 'ai-exploration' },
        ],
      },
      {
        id: 'programming',
        no: '03',
        title: 'Programming',
        tagline: 'Understanding problems through code',
        items: [
          { name: 'C Language & Python', meta: 'Foundation', tags: ['Logic', 'Practice'], slug: 'programming-learning' },
        ],
      },
      {
        id: 'expression',
        no: '04',
        title: 'Expression & Writing',
        tagline: 'Sharing ideas with clarity',
        items: [
          { name: 'Writing, English & communication', meta: 'Growing', tags: ['Structure', 'Collaboration'], slug: 'expression-writing' },
        ],
      },
    ],
  },
}

// 板块配图（横向画廊每张卡片左侧的整高封面）。放到 public/works/covers/ 下。
// 缺图时左栏用大编号渐变占位，放入图片后自动点亮。
export const SECTION_COVERS: Record<string, string> = {
  economics: `${import.meta.env.BASE_URL}works/covers/economics.png`,
  ai: `${import.meta.env.BASE_URL}works/covers/ai.png`,
  programming: `${import.meta.env.BASE_URL}works/covers/expression.png`,
  expression: `${import.meta.env.BASE_URL}works/covers/expression-writing.png`,
}

// 统计一个板块的作品数（items 或 groups 求和），用于索引行 hover 显示
export function sectionCount(section: WorkSection): number {
  if (section.items) return section.items.length
  if (section.groups) return section.groups.reduce((n, g) => n + g.items.length, 0)
  return 0
}
