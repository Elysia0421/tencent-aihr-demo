import { useMemo, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { AppShell, Pill, SectionCard, StatCard } from '@/components/AppShell'
import { fitRanking, hrMetrics, interns, riskSignals, roleDistribution } from '@/data/dashboardData'
import { generateHrSummary } from '@/utils/ai'

type SortKey =
  | 'name'
  | 'role'
  | 'mentor'
  | 'week'
  | 'stage'
  | 'completionRate'
  | 'mentorScore'
  | 'fitScore'
  | 'growthEnergy'
  | 'statusText'
  | 'riskLevel'
  | 'feedbackStatus'
  | 'retentionAdvice'

const riskOrder = { 低风险: 1, 中风险: 2, 高风险: 3 }
const feedbackOrder = { 已反馈: 1, 未反馈: 2 }

export default function HrDashboard() {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: '姓名' },
    { key: 'role', label: '岗位' },
    { key: 'mentor', label: '导师' },
    { key: 'week', label: '周数' },
    { key: 'stage', label: '阶段' },
    { key: 'completionRate', label: '完成率' },
    { key: 'mentorScore', label: '导师评分' },
    { key: 'fitScore', label: '适岗指数' },
    { key: 'growthEnergy', label: '成长能量' },
    { key: 'statusText', label: '状态' },
    { key: 'riskLevel', label: '风险' },
    { key: 'feedbackStatus', label: '反馈' },
    { key: 'retentionAdvice', label: '留用建议' },
  ]

  function updateSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDirection('asc')
  }

  const sortedInterns = useMemo(() => {
    const factor = sortDirection === 'asc' ? 1 : -1

    return [...interns].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'zh-CN') * factor
      if (sortKey === 'role') return a.role.localeCompare(b.role, 'zh-CN') * factor
      if (sortKey === 'mentor') return a.mentor.localeCompare(b.mentor, 'zh-CN') * factor
      if (sortKey === 'week') return (a.week - b.week) * factor
      if (sortKey === 'stage') {
        if (a.week !== b.week) return (a.week - b.week) * factor
        return a.stage.localeCompare(b.stage, 'zh-CN') * factor
      }
      if (sortKey === 'completionRate') return (a.completionRate - b.completionRate) * factor
      if (sortKey === 'mentorScore') return (a.mentorScore - b.mentorScore) * factor
      if (sortKey === 'fitScore') return (a.fitScore - b.fitScore) * factor
      if (sortKey === 'growthEnergy') return (a.growthEnergy - b.growthEnergy) * factor
      if (sortKey === 'statusText') return a.statusText.localeCompare(b.statusText, 'zh-CN') * factor
      if (sortKey === 'riskLevel') return (riskOrder[a.riskLevel] - riskOrder[b.riskLevel]) * factor
      if (sortKey === 'feedbackStatus') return (feedbackOrder[a.feedbackStatus] - feedbackOrder[b.feedbackStatus]) * factor
      return a.retentionAdvice.localeCompare(b.retentionAdvice, 'zh-CN') * factor
    })
  }, [sortDirection, sortKey])

  return (
    <AppShell title="人才洞察台｜群体趋势与留用判断">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {hrMetrics.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={`较上周 ${item.delta}`} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <SectionCard title="岗位结构与表现">
          <div className="h-[320px] rounded-[24px] border border-white/10 bg-white/5 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="role" tick={{ fill: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(2, 6, 23, 0.92)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                  }}
                />
                <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                <Bar dataKey="fitScore" fill="#84cc16" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="AI 管理摘要">
          <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <p className="text-sm leading-7 text-slate-100">{generateHrSummary(interns)}</p>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard title="高潜名单">
          <div className="space-y-3">
            {fitRanking.map((intern, index) => (
              <div key={intern.id} className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Top 0{index + 1}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{intern.name}</p>
                  <p className="text-sm text-slate-400">{intern.role} ｜ {intern.mentor}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-white">{intern.fitScore}</p>
                  <p className="text-sm text-slate-400">{intern.retentionAdvice}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="风险预警">
          <div className="space-y-4">
            {riskSignals.map((risk) => (
              <div key={risk.name} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">{risk.name}</p>
                  </div>
                  <Pill tone={risk.level === '高风险' ? 'bad' : 'warn'}>{risk.level}</Pill>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                    风险原因：{risk.reason}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                    建议动作：{risk.action}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                    是否需要 HR 介入：{risk.hrNeeded ? '需要' : '暂不需要'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="成员全量信息">
          <div className="mb-4 flex flex-wrap gap-3">
            <select
              value={sortKey}
              onChange={(event) => updateSort(event.target.value as SortKey)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key} className="bg-slate-950">
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
            >
              {sortDirection === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
              {sortDirection === 'asc' ? '正序' : '倒序'}
            </button>
          </div>
          <div className="overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <div className="min-w-[1460px]">
                <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.7fr_0.9fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr_1fr] gap-4 bg-white/5 px-5 py-4 text-xs uppercase tracking-[0.22em] text-slate-400">
                  {sortOptions.map((option) => (
                    <button
                      type="button"
                      key={option.key}
                      onClick={() => updateSort(option.key)}
                      className="inline-flex items-center gap-2 text-left"
                    >
                      <span>{option.label}</span>
                      {sortKey === option.key ? (
                        sortDirection === 'asc' ? <ArrowUpAZ className="h-3.5 w-3.5" /> : <ArrowDownAZ className="h-3.5 w-3.5" />
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="divide-y divide-white/10">
                  {sortedInterns.map((intern) => (
                    <div
                      key={intern.id}
                      className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.7fr_0.9fr_0.8fr_0.8fr_0.8fr_0.8fr_1fr_0.8fr_0.8fr_1fr] gap-4 bg-slate-950/40 px-5 py-4 text-sm text-slate-200"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-white">{intern.name}</p>
                      </div>
                      <span className="whitespace-nowrap">{intern.role}</span>
                      <span className="whitespace-nowrap">{intern.mentor}</span>
                      <span className="whitespace-nowrap">第 {intern.week} 周</span>
                      <span className="whitespace-nowrap">{intern.stage}</span>
                      <span className="whitespace-nowrap">{intern.completionRate}%</span>
                      <span className="whitespace-nowrap">{intern.mentorScore}</span>
                      <span className="whitespace-nowrap">{intern.fitScore}</span>
                      <span className="whitespace-nowrap">{intern.growthEnergy}</span>
                      <div className="min-w-0">
                        <p className="truncate">{intern.statusText}</p>
                      </div>
                      <div className="whitespace-nowrap">
                        <Pill tone={intern.riskLevel === '低风险' ? 'good' : intern.riskLevel === '中风险' ? 'warn' : 'bad'}>
                          {intern.riskLevel}
                        </Pill>
                      </div>
                      <div className="whitespace-nowrap">
                        <Pill tone={intern.feedbackStatus === '已反馈' ? 'good' : 'warn'}>{intern.feedbackStatus}</Pill>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate">{intern.retentionAdvice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
