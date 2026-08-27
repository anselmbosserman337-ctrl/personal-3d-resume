// ── Contact 数据源（Web + Print 单一真源）──
// 三个字段均为用户提供真实值（手机号 / QQ / Gmail），无需猜测。
// 如需修改，只需改本文件，无需改动任何组件。

export interface ContactChannel {
  /** 手机号：full 用于复制 / 打印；masked 为网页默认遮挡展示 */
  phone: { full: string; masked: string }
  /** QQ 号 */
  qq: { full: string }
  /** Gmail 地址（用于 mailto 与复制） */
  gmail: { full: string }
}

export const CONTACT: ContactChannel = {
  phone: { full: '19955326026', masked: '199****6026' },
  qq: { full: '2036965032' },
  gmail: { full: 'anselmbosserman337@gmail.com' },
}
