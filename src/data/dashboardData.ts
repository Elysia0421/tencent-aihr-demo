export type RoleType = '研发' | '产品' | '销售'
export type RiskLevel = '低风险' | '中风险' | '高风险'
export type TaskStatus = '已完成' | '进行中' | '待开始'

export type TaskItem = {
  id: string
  category: '学习任务' | '业务任务' | '协作任务'
  title: string
  deadline: string
  status: TaskStatus
  aiHint: string
  relatedAbility: string
}

export type AbilityProfile = {
  岗位专业能力: number
  业务理解能力: number
  沟通协作能力: number
  主动学习能力: number
  结果交付能力: number
}

export type InternRecord = {
  id: string
  name: string
  role: RoleType
  mentor: string
  week: number
  stage: string
  completionRate: number
  mentorScore: number
  fitScore: number
  riskLevel: RiskLevel
  retentionAdvice: string
  growthEnergy: number
  statusText: string
  abilityGrowth: number
  learningInitiative: number
  collaborationScore: number
  reportTone: string
  communicationFrequency: number
  delayedTasks: number
  feedbackStatus: '已反馈' | '未反馈'
  tasks: TaskItem[]
  abilities: AbilityProfile
}

export type AiExample = {
  id: string
  title: string
  scenario: string
  output: {
    headline: string
    points: string[]
    actions: string[]
  }
}

const roleStages = ['认知期', '上手期', '进阶期', '评估期']

const names = [
  '陈同学', '周同学', '林同学', '张同学', '李同学',
  '王同学', '赵同学', '孙同学', '吴同学', '郑同学',
  '冯同学', '何同学', '许同学', '唐同学', '高同学',
  '彭同学', '邓同学', '谢同学', '郭同学', '梁同学',
]

const roles: RoleType[] = [
  '研发', '产品', '销售', '产品', '研发',
  '销售', '研发', '产品', '销售', '研发',
  '产品', '销售', '研发', '产品', '销售',
  '研发', '产品', '销售', '研发', '产品',
]

const mentors = ['李导师', '周导师', '王导师', '陈导师']

function toRiskLevel(score: number): RiskLevel {
  if (score < 60) return '高风险'
  if (score < 72) return '中风险'
  return '低风险'
}

function toAdvice(score: number) {
  if (score >= 85) return '推荐留用'
  if (score >= 70) return '继续培养'
  if (score >= 60) return '需要观察'
  return '重点跟进'
}

function getStatusText(score: number) {
  if (score >= 85) return '高潜成长'
  if (score >= 72) return '稳定成长'
  if (score >= 60) return '需要聚焦'
  return '风险待干预'
}

function buildTasks(role: RoleType, index: number): TaskItem[] {
  const productTasks = [
    ['学习任务', '学习产品需求文档结构', '周三 18:00', '进行中', '先拆出“业务目标-用户场景-交付标准”三段式笔记。', '业务理解能力'],
    ['业务任务', '完成一份竞品分析初稿', '周四 20:00', index % 3 === 0 ? '已完成' : '进行中', '分析时补充目标用户、场景和数据依据。', '结果交付能力'],
    ['协作任务', '与导师完成一次 1v1 沟通', '周五 17:00', '待开始', '沟通前先列 3 个需要确认的问题。', '沟通协作能力'],
  ] as const
  const devTasks = [
    ['学习任务', '阅读项目核心模块代码结构', '周三 18:00', '进行中', '按“模块职责-输入输出-依赖关系”记录学习笔记。', '岗位专业能力'],
    ['业务任务', '完成接口联调与异常排查', '周四 20:00', index % 2 === 0 ? '已完成' : '进行中', '先写 3 个关键日志点再开始排查。', '结果交付能力'],
    ['协作任务', '参加一次技术方案 Review', '周五 17:00', '待开始', '准备 2 个备选方案和风险点。', '沟通协作能力'],
  ] as const
  const salesTasks = [
    ['学习任务', '熟悉重点行业客户画像', '周三 18:00', '进行中', '先梳理客户痛点与产品卖点对应关系。', '业务理解能力'],
    ['业务任务', '完成一轮客户沟通模拟', '周四 20:00', index % 4 === 0 ? '待开始' : '进行中', '模拟中优先练习开场、提问和异议处理。', '岗位专业能力'],
    ['协作任务', '复盘一次导师跟单记录', '周五 17:00', '已完成', '复盘时总结 1 个亮点和 1 个可改进点。', '主动学习能力'],
  ] as const

  const source = role === '产品' ? productTasks : role === '研发' ? devTasks : salesTasks

  return source.map(([category, title, deadline, status, aiHint, relatedAbility], taskIndex) => ({
    id: `${role}-${index}-${taskIndex}`,
    category,
    title,
    deadline,
    status,
    aiHint,
    relatedAbility,
  }))
}

function buildAbilities(role: RoleType, index: number): AbilityProfile {
  const seed = 3 + (index % 3) * 0.25
  if (role === '研发') {
    return {
      岗位专业能力: Number((seed + 0.5).toFixed(1)),
      业务理解能力: Number((seed - 0.1).toFixed(1)),
      沟通协作能力: Number((seed + 0.2).toFixed(1)),
      主动学习能力: Number((seed + 0.4).toFixed(1)),
      结果交付能力: Number((seed + 0.1).toFixed(1)),
    }
  }
  if (role === '产品') {
    return {
      岗位专业能力: Number((seed + 0.2).toFixed(1)),
      业务理解能力: Number((seed + 0.1).toFixed(1)),
      沟通协作能力: Number((seed + 0.5).toFixed(1)),
      主动学习能力: Number((seed + 0.3).toFixed(1)),
      结果交付能力: Number((seed - 0.1).toFixed(1)),
    }
  }
  return {
    岗位专业能力: Number((seed + 0.1).toFixed(1)),
    业务理解能力: Number((seed + 0.3).toFixed(1)),
    沟通协作能力: Number((seed + 0.6).toFixed(1)),
    主动学习能力: Number((seed + 0.2).toFixed(1)),
    结果交付能力: Number((seed - 0.2).toFixed(1)),
  }
}

export const interns: InternRecord[] = names.map((name, index) => {
  const role = roles[index]
  const week = (index % 8) + 2
  const completionRate = [91, 88, 85, 84, 62, 45, 79, 74, 67, 83, 76, 58, 87, 71, 64, 92, 69, 57, 81, 73][index]
  const mentorScore = [4.7, 4.6, 4.4, 4.2, 3.5, 3.1, 4.0, 3.9, 3.6, 4.3, 4.1, 3.2, 4.5, 3.8, 3.4, 4.8, 3.7, 3.0, 4.2, 3.9][index]
  const abilityGrowth = [85, 82, 77, 78, 63, 48, 75, 72, 66, 80, 74, 55, 84, 70, 61, 88, 68, 54, 79, 73][index]
  const learningInitiative = [90, 87, 82, 80, 66, 52, 76, 74, 69, 83, 75, 58, 86, 72, 63, 91, 71, 56, 81, 78][index]
  const collaborationScore = [88, 86, 85, 84, 68, 57, 79, 76, 71, 82, 77, 60, 84, 74, 67, 89, 72, 59, 80, 75][index]
  const fitScore = Math.round(
    completionRate * 0.3 +
    mentorScore * 20 * 0.25 +
    abilityGrowth * 0.2 +
    learningInitiative * 0.15 +
    collaborationScore * 0.1,
  )
  const riskLevel = toRiskLevel(fitScore)

  return {
    id: `intern-${index + 1}`,
    name,
    role,
    mentor: mentors[index % mentors.length],
    week,
    stage: roleStages[Math.min(Math.floor(week / 3), 3)],
    completionRate,
    mentorScore,
    fitScore,
    riskLevel,
    retentionAdvice: toAdvice(fitScore),
    growthEnergy: Math.min(96, fitScore + 4),
    statusText: getStatusText(fitScore),
    abilityGrowth,
    learningInitiative,
    collaborationScore,
    reportTone: fitScore < 60 ? '压力大、有些跟不上、不确定优先级' : fitScore < 72 ? '偶尔迷茫，需要更清晰的目标' : '节奏稳定，愿意主动推进',
    communicationFrequency: fitScore < 60 ? 0 : fitScore < 72 ? 1 : 2,
    delayedTasks: fitScore < 60 ? 3 : fitScore < 72 ? 2 : 0,
    feedbackStatus: fitScore < 70 && index % 2 === 0 ? '未反馈' : '已反馈',
    tasks: buildTasks(role, index),
    abilities: buildAbilities(role, index),
  }
})

export const featuredIntern = interns[3]
export const mentorFocusIntern = interns[4]
export const mentorRiskIntern = interns[5]

export const overviewStats = [
  { label: '在培人数', value: '20', hint: '覆盖 3 类核心业务岗位' },
  { label: '岗位矩阵', value: '研发 / 产品 / 销售', hint: '统一按能力模型运营' },
  { label: '周任务达成率', value: '82%', hint: '较上周提升 6%' },
  { label: '反馈闭环率', value: '75%', hint: '仍有 5 条待完成' },
  { label: '风险对象', value: '3 人', hint: '建议优先关注' },
  { label: '高潜成员', value: '5 人', hint: '可进入留用观察池' },
]

export const hrMetrics = [
  { label: '平均达成率', value: '78%', delta: '+5%' },
  { label: '平均适岗指数', value: '74', delta: '+3' },
  { label: '高潜成员', value: '5', delta: '+1' },
  { label: '中风险对象', value: '4', delta: '-1' },
  { label: '高风险对象', value: '2', delta: '持平' },
  { label: '反馈闭环率', value: '80%', delta: '+8%' },
]

export const roleDistribution = [
  { role: '研发', count: 8, fitScore: 76 },
  { role: '产品', count: 6, fitScore: 73 },
  { role: '销售', count: 6, fitScore: 71 },
]

export const fitRanking = [...interns]
  .sort((a, b) => b.fitScore - a.fitScore)
  .slice(0, 5)

export const riskSignals = [
  {
    name: mentorRiskIntern.name,
    level: '高风险',
    reason: '连续两周周报消极表达，任务完成率仅 45%，且连续 2 次延期。',
    action: '导师与 HR 共同介入，安排 1v1 沟通并拆分下周任务。',
    hrNeeded: true,
  },
  {
    name: interns[11].name,
    level: '中风险',
    reason: '客户沟通演练表现波动较大，沟通频率偏低。',
    action: '导师补充场景训练，并增加一次情景复盘。',
    hrNeeded: false,
  },
  {
    name: mentorFocusIntern.name,
    level: '中风险',
    reason: '多次提到不确定技术方案是否合理，本周完成率低于 70%。',
    action: '建议导师安排技术方案 Review，明确实现路径。',
    hrNeeded: false,
  },
]

export const aiExamples: AiExample[] = [
  {
    id: 'plan',
    title: '生成产品成员第 3 周成长计划',
    scenario: '针对产品方向成员张同学，第 3 周、上手期、成长能量值 78。',
    output: {
      headline: '本周建议聚焦“业务理解 + 初步交付”的双目标推进。',
      points: [
        '优先完成竞品分析初稿，并补充目标用户、场景和结论。',
        '参加一次需求评审会议，记录 3 个关键决策点。',
        '与导师完成 1 次 1v1 沟通，确认下周文档交付标准。',
      ],
      actions: ['每天结束前做 10 分钟复盘', '周四前输出一版结构化分析', '周五前同步本周进展和问题'],
    },
  },
  {
    id: 'risk',
    title: '分析这份周报中的风险信号',
    scenario: '周报出现“不知道优先级、压力有点大、担心跟不上”。',
    output: {
      headline: '该周报存在中等风险信号，核心问题集中在目标模糊和节奏失衡。',
      points: [
        '多次提到不确定优先级，说明业务理解与任务拆解不足。',
        '情绪表达偏消极，需要关注是否存在连续受挫。',
        '下周计划缺少明确交付物，执行可控性偏弱。',
      ],
      actions: ['安排导师 1v1 沟通', '将任务拆成 2 到 3 个里程碑', '继续观察 1 周后再决定 HR 是否介入'],
    },
  },
  {
    id: 'feedback',
    title: '为导师生成一段反馈评语',
    scenario: '研发实习生李同学，本周完成率 62%，技术方案判断不够稳定。',
    output: {
      headline: '建议反馈语气客观、鼓励、具体，并附带明确动作。',
      points: [
        '肯定其主动推进基础开发任务的意愿。',
        '指出方案拆解与时间规划仍需提升。',
        '建议下周先对齐实现路径，再分阶段同步进度。',
      ],
      actions: ['保留亮点描述', '补充待提升点', '附上下一周可执行建议'],
    },
  },
  {
    id: 'summary',
    title: '汇总本周 20 名成员的整体表现',
    scenario: '面向 HR 输出一段 cohort 级整体适岗分析。',
    output: {
      headline: '本周整体表现稳定，产品岗在业务理解上存在共性短板。',
      points: [
        '20 名成员平均完成率为 78%，研发岗稳定性最高。',
        '产品岗在业务目标理解和交付标准确认上表现分化。',
        '销售岗在客户沟通演练任务中差异较大，建议加强复盘。',
      ],
      actions: ['对 2 名高风险对象安排重点跟进', '将高潜成员纳入留用观察池', '增加产品岗案例学习'],
    },
  },
  {
    id: 'retain',
    title: '给 HR 输出留用建议',
    scenario: '结合适岗指数、任务完成率、导师评价与风险信号。',
    output: {
      headline: '留用建议需要区分“推荐留用”“继续培养”“观察跟进”三层。',
      points: [
        '适岗指数 85 分以上且风险低者，可优先推荐留用。',
        '70 到 84 分建议继续培养，重点观察成长速度。',
        '60 分以下需重点跟进，必要时启动联合干预。',
      ],
      actions: ['建立高潜名单', '同步导师复盘', '保留一周跟进记录'],
    },
  },
]
