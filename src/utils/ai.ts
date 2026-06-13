import type { AbilityProfile, InternRecord, RiskLevel } from '@/data/dashboardData'

export type WeeklyReportInput = {
  completed: string
  blockers: string
  learned: string
  nextWeek: string
}

export type WeeklyReportOutput = {
  summary: string
  highlights: string[]
  risks: string[]
  suggestions: string[]
  riskLevel: RiskLevel
}

export type CopilotExample = {
  id: string
  title: string
  context: string
  output: {
    headline: string
    points: string[]
    actions: string[]
  }
}

const riskKeywords = ['迷茫', '压力', '不知道', '跟不上', '不确定', '焦虑']

function detectRiskLevel(text: string, completionRate: number): RiskLevel {
  const hits = riskKeywords.filter((keyword) => text.includes(keyword)).length
  if (completionRate < 60 || hits >= 3) return '高风险'
  if (completionRate < 72 || hits >= 1) return '中风险'
  return '低风险'
}

function summarizeWeakness(abilities: AbilityProfile) {
  const ordered = Object.entries(abilities).sort((a, b) => a[1] - b[1])
  return ordered.slice(0, 2).map(([name]) => name)
}

function summarizeStrength(abilities: AbilityProfile) {
  const ordered = Object.entries(abilities).sort((a, b) => b[1] - a[1])
  return ordered.slice(0, 2).map(([name]) => name)
}

function getInternPersonaLabel(intern: InternRecord) {
  if (intern.fitScore >= 85) return '高潜冲刺型'
  if (intern.fitScore >= 72) return '稳定推进型'
  if (intern.fitScore >= 60) return '需要聚焦型'
  return '风险待干预型'
}

function getInternRiskFocus(intern: InternRecord) {
  if (intern.riskLevel === '高风险') {
    return `当前已出现 ${intern.delayedTasks} 次延期，且周报信号偏消极，需要先稳定节奏和目标理解。`
  }
  if (intern.riskLevel === '中风险') {
    return `当前完成率 ${intern.completionRate}% ，说明任务推进节奏需要进一步拉齐。`
  }
  return `当前整体节奏稳定，可以把精力放在优势放大和结果质量提升上。`
}

function getPriorityTasks(intern: InternRecord) {
  const pendingTasks = intern.tasks.filter((task) => task.status !== '已完成')
  if (pendingTasks.length >= 2) return pendingTasks.slice(0, 2)
  return [...pendingTasks, ...intern.tasks].slice(0, 2)
}

function getStudentDifferentiator(intern: InternRecord) {
  if (intern.role === '研发') {
    return intern.fitScore >= 80 ? '技术方案理解快，适合提前承担更完整的模块任务。'
      : '在方案判断和异常排查上还需要更多里程碑拆解。'
  }
  if (intern.role === '产品') {
    return intern.fitScore >= 80 ? '业务理解和协同表达较强，可以增加更完整的需求分析任务。'
      : '当前更需要把需求目标、用户场景和交付标准说清楚。'
  }
  return intern.fitScore >= 80 ? '客户沟通节奏稳定，可以逐步承担更完整的跟进动作。'
    : '需要先补强开场、提问和异议处理的稳定度。'
}

export function generateGrowthSuggestion(intern: InternRecord) {
  const weakness = summarizeWeakness(intern.abilities)
  return `当前你的主动学习表现保持稳定，但 ${weakness.join(' 和 ')} 仍有明显优化空间。建议在进入下一个任务前先与导师确认业务目标、交付标准和时间节点，并在推进过程中保留阶段性同步，确保任务拆解更清晰、产出结果更稳定。`
}

export function generateWeeklyReport(
  intern: InternRecord,
  input: WeeklyReportInput,
): WeeklyReportOutput {
  const merged = `${input.completed} ${input.blockers} ${input.learned} ${input.nextWeek}`
  const riskLevel = detectRiskLevel(merged, intern.completionRate)
  const weaknesses = summarizeWeakness(intern.abilities)

  return {
    summary: `本周 ${intern.name} 主要完成了${input.completed}。过程中出现${input.blockers}，并沉淀出${input.learned}。下周计划继续推进${input.nextWeek}。整体来看，当前已进入${intern.stage}，接下来的重点应放在任务清晰化、节奏稳定性和交付质量提升上。`,
    highlights: [
      `${intern.name} 在 ${intern.role} 岗位相关任务上保持了 ${intern.completionRate}% 的完成节奏。`,
      `当前能力优势体现在 ${Object.entries(intern.abilities).sort((a, b) => b[1] - a[1])[0][0]}。`,
    ],
    risks: [
      `当前文本信号综合判断为${riskLevel}。`,
      `需要重点关注 ${weaknesses.join('、')} 两个维度的提升。`,
    ],
    suggestions: [
      '将下周计划拆成 2 到 3 个可明确验收的小目标。',
      '在任务开始前与导师对齐优先级、交付标准和时间节点。',
      '每次复盘至少记录 1 个问题与 1 个改进行动。',
    ],
    riskLevel,
  }
}

export function generateMentorFeedback(intern: InternRecord) {
  const strongest = Object.entries(intern.abilities).sort((a, b) => b[1] - a[1])[0][0]
  const weakest = summarizeWeakness(intern.abilities)

  return {
    strengths: [
      `${intern.name} 能够在本周主动推进关键任务，整体任务完成率为 ${intern.completionRate}%。`,
      `在 ${strongest} 方面表现较好，说明其具备一定的岗位适应基础。`,
    ],
    improvements: [
      `${weakest.join('、')} 仍需持续提升，尤其是任务开始前的目标理解和节奏规划。`,
      `建议导师帮助其把抽象任务进一步拆分为更明确的交付物。`,
    ],
    nextActions: [
      '安排一次 1v1 沟通，明确下周重点任务与验收标准。',
      '增加一次阶段性同步，提前识别偏差。',
      '鼓励成员在周进展中记录问题与解决动作。',
    ],
    fullFeedback: `本周 ${intern.name} 能够主动推进 ${intern.role} 相关任务，整体保持了 ${intern.completionRate}% 的任务完成率，说明其已具备较好的执行基础。与此同时，在 ${weakest.join('和')} 上仍有提升空间。建议下周在任务开始前先与导师确认实现路径或业务目标，并在推进过程中保持阶段性同步，以提升结果交付的稳定性与清晰度。`,
  }
}

export function generateHrSummary(interns: InternRecord[]) {
  const averageCompletion = Math.round(
    interns.reduce((total, intern) => total + intern.completionRate, 0) / interns.length,
  )
  const productAverage = Math.round(
    interns.filter((intern) => intern.role === '产品').reduce((sum, intern) => sum + intern.fitScore, 0) /
      interns.filter((intern) => intern.role === '产品').length,
  )
  const highRiskCount = interns.filter((intern) => intern.riskLevel === '高风险').length

  return `本周 ${interns.length} 名成员平均任务完成率为 ${averageCompletion}%，整体表现稳定。研发岗节奏最平稳，产品岗平均适岗指数为 ${productAverage}，在业务理解方面存在共性短板；销售岗在客户沟通演练任务中分化明显。当前共有 ${highRiskCount} 名高风险对象，建议下周优先安排导师 1v1 沟通，并针对产品岗追加业务案例学习。`
}

export function getRiskKeywords() {
  return riskKeywords
}

export function generateInternCopilotExamples(
  intern: InternRecord,
  input: WeeklyReportInput,
): CopilotExample[] {
  const weeklyReport = generateWeeklyReport(intern, input)
  const strongestAbilities = summarizeStrength(intern.abilities)
  const weakestAbilities = summarizeWeakness(intern.abilities)
  const strongestAbility = strongestAbilities[0]
  const priorityTasks = getPriorityTasks(intern)
  const personaLabel = getInternPersonaLabel(intern)
  const riskFocus = getInternRiskFocus(intern)

  return [
    {
      id: 'intern-plan',
      title: '生成我的本周成长计划',
      context: `${intern.name}｜${intern.role}｜第 ${intern.week} 周｜${intern.stage}｜${personaLabel}`,
      output: {
        headline: `${intern.name} 当前属于“${personaLabel}”，本周优先围绕“${priorityTasks[0]?.relatedAbility ?? '业务理解能力'} + ${priorityTasks[1]?.relatedAbility ?? '结果交付能力'}”推进。`,
        points: [
          `当前状态：${intern.statusText}｜适岗 ${intern.fitScore}｜成长能量 ${intern.growthEnergy}`,
          `优先任务 1：${priorityTasks[0]?.title ?? intern.tasks[0]?.title}｜${priorityTasks[0]?.aiHint ?? intern.tasks[0]?.aiHint}`,
          `优先任务 2：${priorityTasks[1]?.title ?? intern.tasks[1]?.title}｜${priorityTasks[1]?.aiHint ?? intern.tasks[1]?.aiHint}`,
          `个体差异：${getStudentDifferentiator(intern)}`,
        ],
        actions: [
          `优先保持 ${strongestAbility} 的优势输出，并重点补齐 ${weakestAbilities.join('、')}。`,
          intern.riskLevel === '低风险'
            ? '把下一个任务从“完成”升级为“可复用模板”，沉淀个人方法。'
            : '先把当前任务拆成 2 到 3 个小里程碑，每完成一个就和导师快速对齐一次。',
          `本周至少与 ${intern.mentor} 做 1 次目标确认，避免“${intern.reportTone}”再次出现。`,
        ],
      },
    },
    {
      id: 'intern-report',
      title: '生成我的周报定稿',
      context: `${intern.name} 当前填写内容将整理为更符合 ${intern.role} 场景的周报表达`,
      output: {
        headline: `已整理出更符合 ${intern.name} 当前阶段的周报定稿重点。`,
        points: [
          weeklyReport.summary,
          ...weeklyReport.highlights,
          `建议突出 ${priorityTasks[0]?.title ?? '本周核心任务'} 的结果产出，避免周报只有过程没有结果。`,
        ],
        actions: [
          `补充一个最具体的结果指标，让 ${intern.role} 岗周报更有交付感。`,
          intern.riskLevel === '高风险'
            ? '下周计划只保留 2 个最核心动作，先恢复稳定推进节奏。'
            : '把下周计划拆成 2 到 3 个可验收的小目标，便于导师快速判断进展。',
          `增加一句“需要导师支持的事项”，让 ${intern.mentor} 能更快给到帮助。`,
        ],
      },
    },
    {
      id: 'intern-risk',
      title: '分析我的风险信号',
      context: `结合完成率 ${intern.completionRate}%、延期 ${intern.delayedTasks} 次与周报文本信号综合判断`,
      output: {
        headline: `当前判断为${weeklyReport.riskLevel}，${riskFocus}`,
        points: [
          ...weeklyReport.risks,
          `沟通频率：每周 ${intern.communicationFrequency} 次｜反馈状态：${intern.feedbackStatus}`,
          `当前短板主要集中在 ${weakestAbilities.join('、')}。`,
        ],
        actions: [
          ...weeklyReport.suggestions,
          intern.riskLevel === '低风险'
            ? '继续保持当前节奏，同时主动争取一个更完整的任务闭环。'
            : '把本周最容易卡住的任务提前暴露给导师，不要等到截止前再处理。',
        ],
      },
    },
  ]
}

export function generateMentorCopilotExamples(intern: InternRecord): CopilotExample[] {
  const feedback = generateMentorFeedback(intern)
  const personaLabel = getInternPersonaLabel(intern)

  return [
    {
      id: 'mentor-feedback',
      title: '生成当前成员反馈',
      context: `${intern.name}｜${intern.role}｜完成率 ${intern.completionRate}%｜适岗 ${intern.fitScore}｜${personaLabel}`,
      output: {
        headline: '建议反馈同时覆盖亮点、问题和下周动作。',
        points: [...feedback.strengths, ...feedback.improvements],
        actions: feedback.nextActions,
      },
    },
    {
      id: 'mentor-risk',
      title: '分析当前成员风险',
      context: `当前风险等级 ${intern.riskLevel}｜学生画像 ${personaLabel}｜周报信号：“${intern.reportTone}”`,
      output: {
        headline: `${intern.name} 当前更需要通过拆分任务和增加同步来稳定节奏。`,
        points: [
          `当前完成率为 ${intern.completionRate}% ，需要重点关注交付稳定性。`,
          `当前风险等级为 ${intern.riskLevel}，说明需要按周跟进推进情况。`,
          `周报信号为“${intern.reportTone}”，建议优先校准目标理解。`,
        ],
        actions: [
          '安排一次 1v1 沟通，明确下周重点任务与验收标准。',
          '把抽象任务拆成 2 到 3 个里程碑并逐步校准。',
          '在本周中段增加一次状态同步，提前发现偏差。',
        ],
      },
    },
    {
      id: 'mentor-plan',
      title: '生成下周带教动作',
      context: `基于 ${intern.name} 当前阶段 ${intern.stage}、学生画像 ${personaLabel} 与能力画像生成`,
      output: {
        headline: '下周带教动作建议围绕目标澄清、过程同步和结果复盘展开。',
        points: [
          `优先补强 ${summarizeWeakness(intern.abilities).join('、')} 两个维度。`,
          `当前导师评分 ${intern.mentorScore}，说明需要继续强化稳定交付。`,
          `建议下周将任务节奏从“结果导向”拆成“阶段导向”。`,
        ],
        actions: [
          '周初做任务拆解，周中做进度校准，周末做结果复盘。',
          '为关键任务设定明确的交付样例，降低理解偏差。',
          '把成员问题沉淀为带教记录，便于连续观察。',
        ],
      },
    },
  ]
}

export function generateHrCopilotExamples(interns: InternRecord[]): CopilotExample[] {
  const summary = generateHrSummary(interns)
  const highPotentialInterns = [...interns].sort((a, b) => b.fitScore - a.fitScore).slice(0, 3)
  const highRiskInterns = interns.filter((intern) => intern.riskLevel === '高风险').slice(0, 3)

  return [
    {
      id: 'hr-summary',
      title: '生成本周群体总结',
      context: `基于 ${interns.length} 名成员的完成率、适岗指数和风险分层生成`,
      output: {
        headline: '当前 cohort 表现稳定，但岗位间存在明显分化。',
        points: [summary],
        actions: [
          '对产品岗追加业务案例学习，统一目标理解标准。',
          '对高风险对象安排导师 1v1 并保留一周跟进记录。',
          '把高潜成员纳入留用观察池，持续追踪成长速度。',
        ],
      },
    },
    {
      id: 'hr-retain',
      title: '输出留用建议',
      context: '结合适岗指数、导师评价、任务完成率和风险信号',
      output: {
        headline: '留用建议需要按高潜、继续培养、重点观察三层输出。',
        points: highPotentialInterns.map(
          (intern) => `${intern.name}｜${intern.role}｜适岗 ${intern.fitScore}｜${intern.retentionAdvice}`,
        ),
        actions: [
          '优先同步高潜成员近两周表现，形成留用依据。',
          '对继续培养对象补充岗位导师观察结论。',
          '对需要观察对象增加一轮阶段性评估。',
        ],
      },
    },
    {
      id: 'hr-risk',
      title: '识别高风险名单',
      context: '结合完成率、周报消极信号、反馈缺失与延期情况综合判断',
      output: {
        headline: '当前高风险对象需要导师与 HR 联合跟进。',
        points:
          highRiskInterns.length > 0
            ? highRiskInterns.map(
                (intern) =>
                  `${intern.name}｜完成率 ${intern.completionRate}%｜延期 ${intern.delayedTasks} 次｜反馈 ${intern.feedbackStatus}`,
              )
            : ['当前暂无高风险对象。'],
        actions: [
          '对高风险对象安排联合面谈，明确下周干预动作。',
          '要求导师补齐反馈记录，避免信息断层。',
          '持续跟踪风险关键词与完成率变化，判断是否升级介入。',
        ],
      },
    },
  ]
}
