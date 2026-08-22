import { motion } from 'framer-motion'
import { FOCUS_POINTS } from '../data/focusPoints'

// 履历数据（双语）。英文为译稿，可按需润色。
interface ResumeEntry {
  period: string
  place: string
  role?: string
  points?: string[]
  image?: string
}
const RESUME: Record<'en' | 'zh', { title: string; entries: ResumeEntry[] }> = {
  en: {
    title: 'Résumé',
    entries: [
      {
        period: '2026.09 – Present',
        place: 'Minzu University of China',
        role: 'Incoming B.A. student in Economics',
        points: [
          'From Wuhu, Anhui · Communist Youth League member',
          'Contact: 2036965032@qq.com',
          'Interested in economics, financial markets, business analysis, and AI applications',
        ],
      },
      {
        period: 'Summer 2026',
        place: 'Artificial Intelligence',
        role: 'DAMO Academy Advanced Artificial Intelligence Trainer Certificate',
        points: [
          'Studied linear neural networks, multilayer perceptrons (MLP), convolutional neural networks (CNN), and recurrent neural networks (RNN)',
          'Further explored long short-term memory (LSTM) networks and Transformer architectures',
          'Completed several hands-on AI projects independently',
        ],
      },
      {
        period: '2023.09 – 2026.06',
        place: 'Wuhu No. 1 High School',
        role: 'High school education',
        points: [
          'Built self-directed learning, time management, resilience, and communication skills in a rigorous academic environment',
        ],
      },
      {
        period: '2023.09 – 2026.06',
        place: 'Chemistry Class Representative',
        role: 'Wuhu No. 1 High School',
        points: [
          'Managed learning materials, coordinated classroom information, and collected feedback',
          'Helped classmates with questions and organized knowledge into clear study notes',
        ],
      },
      {
        period: 'Senior Year',
        place: 'Jiangnan Ten-School Joint Examination',
        role: '3rd place in Chinese essay competition',
        points: ['Recognized for structured writing and clear expression'],
      },
      {
        period: 'Grade 11',
        place: 'NEPCS · Anhui Province',
        role: 'Third Prize',
        points: ['National English Proficiency Competition for Secondary School Students'],
        image: `${import.meta.env.BASE_URL}images/english-competition-evidence.png`,
      },
    ],
  },
  zh: {
    title: 'Résumé',
    entries: [
      {
        period: '2026.09 – 至今',
        place: '中央民族大学',
        role: '经济学专业 · 准大一新生',
        points: [
          '安徽芜湖人 · 共青团员',
          '联系邮箱：2036965032@qq.com',
          '关注经济学、金融市场、商业分析，以及 AI 与经济学的交叉应用',
        ],
      },
      {
        period: '2026 年暑期',
        place: '人工智能',
        role: '人工智能高级训练师证书',
        points: [
          '暑期系统自学线性神经网络、多层感知机（MLP）、卷积神经网络（CNN）与循环神经网络（RNN）',
          '进一步学习长短期记忆网络（LSTM）与 Transformer 的核心结构和应用场景',
          '并成功手动实践完成多个 AI 项目',
        ],
      },
      {
        period: '2023.09 – 2026.06',
        place: '芜湖市第一中学',
        role: '高中阶段',
        points: [
          '在重点高中学习环境中培养自主学习、时间管理、抗压能力与表达能力',
        ],
      },
      {
        period: '2023.09 – 2026.06',
        place: '高中化学课代表',
        role: '芜湖市第一中学',
        points: [
          '协助老师完成作业收发、资料整理、课堂信息传递及学习反馈',
          '帮助同学答疑，提升沟通表达、责任意识和知识梳理能力',
        ],
      },
      {
        period: '高三',
        place: '江南十校大型联考',
        role: '语文作文联考第 3 名',
        points: ['展现结构化写作与清晰表达能力'],
      },
      {
        period: '高二',
        place: '全国中学生英语能力竞赛 NEPCS',
        role: '安徽省三等奖',
        points: ['持续提升英语阅读、表达与跨文化沟通能力'],
        image: `${import.meta.env.BASE_URL}images/english-competition-evidence.png`,
      },
    ],
  },
}

// 履历条目依次对应 glb 里的聚焦锚点（相机停靠点），顺序须与 entries 一致。
// 名单是唯一真源，见 data/focusPoints.ts（Scene.tsx 也从那里取）。
const POINT_ORDER = FOCUS_POINTS

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  return (
    <motion.div
      className="tl-entry"
      data-point={POINT_ORDER[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body 包住文字内容（点保持在外做时间轴标记）：移动端可给它加卡片衬底，
          且它紧贴内容高度，不含 tl-entry 用于排布的大 padding。
          用普通 div（非 motion）：framer 变体经 React context 穿透它，叶子元素仍是
          tl-entry 的直接 stagger 子级，入场动画与包裹前完全一致。 */}
      <div className="tl-body">
        <motion.div className="tl-period" variants={itemV}>
          {entry.period}
        </motion.div>
        <motion.div className="tl-head" variants={itemV}>
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {entry.points && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.image && (
          <motion.img
            className="tl-evidence-image"
            src={entry.image}
            alt={`${entry.place} supporting image`}
            loading="lazy"
            decoding="async"
            variants={itemV}
          />
        )}
      </div>
    </motion.div>
  )
}

export default function Resume({ lang }: { lang: 'en' | 'zh' }) {
  const data = RESUME[lang]
  return (
    <section className="resume" lang={lang}>
      <motion.h2
        className="resume-title"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {data.title}
      </motion.h2>
      <div className="timeline">
        {data.entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
