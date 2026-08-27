import { motion } from 'framer-motion'

const SKILLS = {
  zh: {
    title: 'Skills',
    intro: '用好奇心连接经济、数据与技术。',
    items: ['C Language', 'Python', 'AI 应用', '经济与数据分析', '英语能力', '表达与写作', '快速学习', '沟通协作'],
  },
  en: {
    title: 'Skills',
    intro: 'Connecting economics, data, and technology with curiosity.',
    items: ['C Language', 'Python', 'AI Applications', 'Economics & Data Analysis', 'English', 'Writing', 'Fast Learning', 'Collaboration'],
  },
}

export default function Skills({ lang }: { lang: 'en' | 'zh' }) {
  const data = SKILLS[lang]
  return (
    <section className="skills" id="skills" lang={lang}>
      <motion.div
        className="skills-inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 0.7 }}
      >
        <h2>{data.title}</h2>
        <p>{data.intro}</p>
        <div className="skills-list">
          {data.items.map((item) => (
            <span key={item} className="skill-tag">
              {item}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
