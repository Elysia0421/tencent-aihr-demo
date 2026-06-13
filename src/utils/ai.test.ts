import { describe, expect, it } from 'vitest'

import { featuredIntern, mentorRiskIntern } from '@/data/dashboardData'
import { generateHrSummary, generateWeeklyReport, getRiskKeywords } from '@/utils/ai'

describe('ai utils', () => {
  it('应在低完成率时识别高风险周报', () => {
    const output = generateWeeklyReport(mentorRiskIntern, {
      completed: '完成了一部分客户模拟任务',
      blockers: '压力有点大，不知道优先级是什么，感觉有些跟不上',
      learned: '知道了要先问清楚目标',
      nextWeek: '先补齐延期任务，再和导师沟通',
    })

    expect(output.riskLevel).toBe('高风险')
    expect(output.risks.join('')).toContain('高风险')
  })

  it('应生成包含整体情况的 HR 总结', () => {
    const summary = generateHrSummary([featuredIntern, mentorRiskIntern])

    expect(summary).toContain('平均任务完成率')
    expect(summary).toContain('高风险实习生')
  })

  it('应暴露风险关键词配置', () => {
    expect(getRiskKeywords()).toContain('迷茫')
  })
})
