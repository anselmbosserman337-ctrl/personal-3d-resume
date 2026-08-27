// PROJECT NOVA — Case Study 内容数据（单项目，结构化存储，便于后续维护）。
// 全部文字以用户提供的真实资料为准，未做任何虚构。
// 图片：当前仅有 1 张 6 画面总图（gallery-composite.jpg），未裁切；
// 后续若提供 6 张原图，只需替换 gallery[] 的 thumb 字段并在 CSS 中启用即可。

export interface NovaRoleSection {
  heading: string
  paragraphs: string[]
}

export interface NovaTech {
  name: string
  desc: string
}

export interface NovaTimelineStep {
  no: string
  title: string
  desc: string
}

export interface NovaGalleryItem {
  no: string
  title: string
  caption: string
}

export interface ProjectNova {
  slug: string
  name: string
  category: string
  type: string
  period: string
  role: string[]
  /** 当前唯一视觉资源：6 画面总图 */
  composite: string
  background: string[]
  roleSections: NovaRoleSection[]
  techStack: NovaTech[]
  codexNote: string
  timeline: NovaTimelineStep[]
  gallery: NovaGalleryItem[]
  resultFlow: string[]
  resultSupports: string[]
  resultText: string[]
  finalStatus: { version: string; tagline: string; lines: string[] }
  viewProject: string
  viewSource: string
  devNote: string
}

const BASE = import.meta.env.BASE_URL

export const projectNova: ProjectNova = {
  slug: 'project-nova',
  name: 'PROJECT NOVA',
  category: 'Interactive Game Development',
  type: '2D Vertical Sci-Fi Shooter',
  period: '2026.08.15 — 2026.08.21',
  role: [
    'Game Design',
    'Art Direction',
    'Audio Direction',
    'Playtesting',
    'QA',
    'Iteration',
  ],
  composite: `${BASE}works/nova/gallery-composite.jpg`,

  // ── 01 / PROJECT BACKGROUND ──
  background: [
    `PROJECT NOVA 最初来自一个很简单的想法：我希望不只是完成一个“能够移动和射击”的小游戏，而是真正尝试从零构建一套相对完整的游戏体验。`,
    `因此，项目从最基础的玩家移动、射击与敌人生成开始，逐渐扩展到敌人类型、波次系统、Boss 战、游戏状态、视觉反馈、UI、音频与完整结算流程。`,
    `在开发过程中，我逐渐发现，一个游戏是否“像一个完整作品”，并不只取决于功能数量。玩家看到的每一帧画面、敌机出现的节奏、Boss 登场方式、背景滚动、受击反馈、音乐切换，甚至按钮的位置和字体间距，都会直接影响最终体验。`,
    `因此，PROJECT NOVA 后期的重点从单纯“增加功能”，转向了三个更具体的目标：`,
    `完整性 —— 让游戏具备从 Main Menu、普通战斗、波次推进、Boss Warning、Atlas Boss 战，到 Victory / Game Over / Retry 的完整流程。`,
    `一致性 —— 让玩家、敌机、Boss、背景、UI 与音乐保持统一的深空科幻视觉语言，而不是多个独立素材简单拼接。`,
    `可玩性 —— 通过持续实机测试调整敌人数量、Boss 攻击节奏、玩家生命值、射击速度以及界面反馈，使整个第一关能够被正常理解、挑战和完成。`,
    `这个项目也让我第一次比较完整地体验了一个游戏从“功能原型”逐渐变成“可展示作品”的过程。`,
  ],

  // ── 02 / MY ROLE ──
  roleSections: [
    {
      heading: 'Game Design',
      paragraphs: [
        `我首先确定了游戏的核心方向：2D 纵版射击 + 科幻未来主题 + 波次推进 + Boss 战。`,
        `在核心玩法基础上，继续规划：Scout / Fighter / Heavy 三种普通敌机；不同敌机的生命值、速度与移动特点；Wave 1、Wave 2、Final Wave 的关卡节奏；玩家双枪 Plasma Bolt 射击；碰撞、伤害、无敌时间与生命值系统；Atlas Boss 的 Phase 1 / Phase 2；Boss Warning；Victory / Game Over / Retry；掉落、升级以及后续玩法扩展接口。`,
        `我并没有在 v1.0 阶段无限增加功能，而是在开发后期主动控制范围，将 Laser、Missile、新 Boss、新关卡以及更复杂的 Roguelite 系统留给后续版本。这样可以优先保证第一版真正完成。`,
      ],
    },
    {
      heading: 'Art Direction',
      paragraphs: [
        `我确定了整个游戏的核心视觉方向：Deep Space · Cold Sci-Fi · Military Futuristic · Blue vs Red。`,
        `玩家阵营主要使用：银白机体、冰蓝能源、蓝色 Plasma Bolt。敌方阵营则使用：枪黑装甲、暗红能源核心、红色弹幕。Atlas 作为最终 Boss，则进一步强化黑色重装甲与红色过载能源的视觉压迫感。`,
        `我持续参与并验收：Astra-01 玩家飞船、Scout、Fighter、Heavy、Atlas、双方子弹、尾焰、爆炸、Deep Space 背景、Nebula 视差背景、Boss Explosion、UI 与 HUD。`,
        `素材接入之后，我还针对动画帧进行了实际检查。例如曾发现：敌机 Move 帧存在 2–4px 的视觉中心偏移；Heavy Spawn 存在约 3.8px 的垂直偏移；普通 Explosion 两帧爆炸核心存在约 8–10px 的跳动。这些问题后来都通过素材重新对齐解决，而不是通过代码逐帧添加 offset 掩盖。`,
        `最终：Astra-01 Art Pass — LOCKED · Enemy Fleet Art Pass — LOCKED · Atlas Art Pass — LOCKED · Background Art Pass — LOCKED。`,
      ],
    },
    {
      heading: 'UI / UX Direction',
      paragraphs: [
        `PROJECT NOVA 最初的 UI 更接近开发阶段界面。后期我重新确定了 UI 的视觉原则：Deep Navy Glass + Ice Cyan + White + Danger Red + Victory Gold，并要求减少廉价的“满屏霓虹科技框”，改成更克制的战术 HUD。`,
        `最终完成：PROJECT NOVA Main Menu、START MISSION、HP、Score、Kills、Combo、Weapon、Wave Announcement、Boss Warning、Boss HUD、Pause、Mission Failed、Mission Complete、Retry、Main Menu、鼠标 hover / active / click、CSS 缩放后的点击坐标适配。`,
        `后续实机测试中，我又发现 Game Over 的 COMBAT RECORD / SCORE / KILLS 等文本出现重叠。继续检查后发现是旧布局和新布局同时存在，最终重新整理为统一的两列统计结构。`,
      ],
    },
    {
      heading: 'Audio Direction',
      paragraphs: [
        `音乐部分没有采用传统高强度街机 EDM，而是希望让音乐本身参与关卡叙事。最终设计为三阶段 BGM：Wave 1 — Exploration（深空、未知、战争刚刚开始）；Wave 2 + Final Wave — Battle（敌人数量增加，节奏与规模感增强）；Boss Warning + Atlas — Boss（氛围转向压迫、追逐和最终决战）。`,
        `为了让不同阶段之间不会突然硬切，我进一步提出加入 1.5 秒 Crossfade。最终音乐流程变成：bgm_early → Crossfade → bgm_battle → Final Wave 连续播放 → Crossfade → bgm_boss。Atlas Phase 2 不会重新启动音乐，Pause / Resume 也能够继续原来的播放进度。`,
      ],
    },
    {
      heading: 'Playtesting & QA',
      paragraphs: [
        `我进行了大量真实浏览器测试。很多后期问题不是代码语法错误，而是实际玩的时候才会出现。`,
        `例如：敌机受到攻击时出现白色矩形；Astra-01 受击出现白色方块；Atlas Hit Flash 存在类似问题；WARNING 与警告符号发生重叠；FINAL WAVE 与 Boss Warning 同时出现；Game Over 文本重叠；BGM 玩到一半可能停止；阶段音乐切换过于生硬；MENG 身份标识存在感太弱；开局出现运行时卡顿；背景循环高度与逻辑 Canvas 高度不一致。`,
        `我会在实际游玩中记录这些问题，再针对问题进行修复与复验。例如敌机受击白块最终定位到 fillRect() 直接覆盖整个透明 Sprite 逻辑矩形。后续改为：正常绘制 Sprite，并基于同一 PNG Alpha 轮廓进行亮度叠加。这样透明区域不会再变成白色方块。`,
      ],
    },
  ],

  // ── 03 / TECH STACK ──
  techStack: [
    {
      name: 'JavaScript',
      desc: '负责游戏核心逻辑：Game Loop、状态系统、玩家、敌人、Boss、波次、碰撞、伤害、对象池、UI、音频、输入、事件系统。',
    },
    {
      name: 'HTML5 Canvas',
      desc: '用于主要游戏画面渲染：玩家、敌人、背景、子弹、特效、HUD、Boss Warning、Overlay、菜单。',
    },
    {
      name: 'Web Audio API',
      desc: '用于 SFX、Battle BGM、Boss BGM、Pause / Resume、Crossfade 与音乐阶段切换。',
    },
    {
      name: 'CSS',
      desc: '用于菜单、HUD、按钮、警告界面与结算界面的视觉与交互，包括 CSS 缩放后的点击坐标适配。',
    },
    {
      name: 'Git',
      desc: '每个重要开发阶段独立提交版本：Combat、Level、Boss、Art Pass、UI、Audio、QA、Runtime Hotfix。',
    },
    {
      name: 'GitHub',
      desc: '作为项目版本仓库与后续协作 / 展示的托管平台。',
    },
    {
      name: 'Codex',
      desc: '用于代码实现、系统扩展、Bug 修复、结构审计、测试、性能分析与工程辅助。',
    },
  ],
  codexNote:
    'AI / Codex was used as a development assistant for implementation, debugging and iterative testing.',

  // ── 04 / DEVELOPMENT ──
  timeline: [
    { no: '01', title: 'Core Prototype', desc: '建立 Game、GameLoop、AssetLoader、Canvas、输入、Player、Camera，完成最基础的移动与运行框架。' },
    { no: '02', title: 'Combat System', desc: '加入 Player Bullet、双枪射击、Bullet Pool、Collision、Damage、HP、Enemy Death，游戏第一次拥有真正的战斗循环。' },
    { no: '03', title: 'Enemy Fleet', desc: '加入 Scout、Fighter、Heavy、Enemy Pool、Spawn System，以及不同移动方式与生命值、速度。' },
    { no: '04', title: 'Presentation & Feedback', desc: '加入 Muzzle Flash、Explosion、Bullet Trail、Floating Damage、Camera Shake、Player Hit、HUD、Score、Combo。' },
    { no: '05', title: 'Complete Game Loop', desc: '完成 Main Menu、Playing、Pause、Game Over、Victory、Retry、Reset。' },
    { no: '06', title: 'Wave & Level', desc: '设计 Wave 1、Wave 2、Final Wave、Difficulty Curve、Formation、Wave Announcement。' },
    { no: '07', title: 'Atlas Boss', desc: '加入 Atlas、Boss State、Phase 1 / Phase 2、Boss Warning、Boss HUD、Enemy Bullet、Spread Shot、Boss Explosion、Level Complete。' },
    { no: '08', title: 'Art Pass', desc: '正式接入并验收 Astra-01、Enemy Fleet、Atlas、Deep Space、Nebula、Projectile、Explosion、Tail Flame。' },
    { no: '09', title: 'UI Polish', desc: '重新设计 Main Menu、HUD、Boss Warning、Pause、Mission Failed、Mission Complete、Buttons、Mouse Interaction。' },
    { no: '10', title: 'Audio Direction', desc: '建立 Early BGM、Battle BGM、Boss BGM、Crossfade、Audio lifecycle、Pause / Resume。' },
    { no: '11', title: 'QA & Runtime Fixes', desc: '通过持续实机测试修复 Hit Flash 白块、Warning 重叠、Result UI 重叠、Background Seamless、Audio 生命周期、性能分配峰值、资源命名、动画帧偏移。' },
    { no: '12', title: 'Final Build', desc: '最终形成完整第一关。' },
  ],

  // ── 05 / GALLERY ──
  gallery: [
    { no: '01', title: 'MAIN MENU', caption: '深空战术风格主菜单，完成正式 UI Polish 后的游戏入口（START MISSION / WavePeak Elite / PILOT // MENG）。' },
    { no: '02', title: 'WAVE COMBAT', caption: 'Astra-01 使用双 Plasma Bolt 与不同敌机编队进行战斗。' },
    { no: '03', title: 'FINAL WAVE', caption: '随关卡推进提升敌人数量、机型与战斗压力。' },
    { no: '04', title: 'BOSS WARNING', caption: 'Final Wave 结束后进入 Atlas Boss Warning，并同步切换 Boss BGM。' },
    { no: '05', title: 'ATLAS PHASE 2', caption: '当 Atlas HP 降至 50% 后进入 Phase 2，并切换攻击模式与视觉反馈。' },
    { no: '06', title: 'VICTORY', caption: 'Boss Death Sequence 完成后进入 Victory 结算界面（Score / Kills / Best Combo / Grade）。' },
  ],

  // ── 06 / RESULT ──
  resultFlow: [
    'Main Menu',
    'Wave 1',
    'Wave 2',
    'Final Wave',
    'Boss Warning',
    'Atlas Phase 1',
    'Atlas Phase 2',
    'Boss Explosion',
    'Mission Complete',
  ],
  resultSupports: ['Pause', 'Resume', 'Game Over', 'Retry', 'Main Menu', 'Reset'],
  resultText: [
    `PROJECT NOVA 最终完成了一套完整的第一关游戏体验。玩家可以从 Main Menu 开始任务，经过 Wave 1 → Wave 2 → Final Wave → Boss Warning → Atlas Phase 1 → Atlas Phase 2 → Boss Explosion，最终进入 Mission Complete。`,
    `在最终版本中，我完成了玩家、敌机、Boss、背景、UI 与音乐的统一，并通过多轮真实浏览器测试不断修正视觉、音频与交互问题。`,
    `最终 PROJECT NOVA 从一个基础纵版射击原型，逐渐发展成一个具有完整游戏循环、独立视觉语言、Boss 战、阶段音乐叙事、正式 UI、资源系统、对象池、视觉反馈、状态管理、完整结算流程的可玩游戏作品。`,
  ],

  // ── FINAL STATUS ──
  finalStatus: {
    version: 'PROJECT NOVA — v1.0',
    tagline: 'Playable First Level',
    lines: ['Astra-01 × Enemy Fleet × Atlas', 'Deep Space Mission Complete.'],
  },

  // 无真实部署地址 / GitHub Repo → 不跳转，显示占位
  viewProject: 'COMING SOON',
  viewSource: 'SOURCE LINK PENDING',

  devNote:
    'Development Note — AI / Codex was used as an implementation and debugging assistant throughout the iterative development process.',
}
