import { useMemo, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppShell, Pill, SectionCard } from '@/components/AppShell'
import { interns, mentorFocusIntern } from '@/data/dashboardData'
import { useDashboardStore } from '@/store/useDashboardStore'
import { generateMentorFeedback } from '@/utils/ai'

type SortKey = 'name' | 'role' | 'stage' | 'completionRate' | 'riskLevel' | 'feedbackStatus'

const riskOrder = { 低风险: 1, 中风险: 2, 高风险: 3 }
const feedbackOrder = { 已反馈: 1, 未反馈: 2 }

export default function MentorDashboard() {
  const navigate = useNavigate()
  const { currentMentorName, currentUser, selectedInternId, setCurrentInternId, setSelectedInternId } = useDashboardStore()
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const mentorTeam = currentUser?.role === 'hr' ? interns : interns.filter((intern) => intern.mentor === currentMentorName)
  const sortedMentorTeam = useMemo(() => {
    const factor = sortDirection === 'asc' ? 1 : -1
    const sorted = [...mentorTeam].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name, 'zh-CN') * factor
      if (sortKey === 'role') return a.role.localeCompare(b.role, 'zh-CN') * factor
      if (sortKey === 'stage') {
        if (a.week !== b.week) return (a.week - b.week) * factor
        return a.stage.localeCompare(b.stage, 'zh-CN') * factor
      }
      if (sortKey === 'completionRate') return (a.completionRate - b.completionRate) * factor
      if (sortKey === 'riskLevel') return (riskOrder[a.riskLevel] - riskOrder[b.riskLevel]) * factor
      return (feedbackOrder[a.feedbackStatus] - feedbackOrder[b.feedbackStatus]) * factor
    })
    return sorted
  }, [mentorTeam, sortDirection, sortKey])
  const currentIntern =
    sortedMentorTeam.find((intern) => intern.id === selectedInternId) ?? sortedMentorTeam[0] ?? mentorFocusIntern
  const lowProgressIntern = mentorTeam.find((intern) => intern.completionRate < 70) ?? currentIntern
  const priorityIntern = mentorTeam.find((intern) => intern.riskLevel === '高风险') ?? lowProgressIntern
  const pendingFeedbackCount = mentorTeam.filter((intern) => intern.feedbackStatus === '未反馈').length

  const feedback = useMemo(() => generateMentorFeedback(currentIntern), [currentIntern])
  const sortOptions: { key: SortKey; label: string }[] = [
    { key: 'name', label: '姓名' },
    { key: 'role', label: '岗位' },
    { key: 'stage', label: '阶段' },
    { key: 'completionRate', label: '完成率' },
    { key: 'riskLevel', label: '风险' },
    { key: 'feedbackStatus', label: '反馈' },
  ]

  function updateSort(nextKey: SortKey) {
    if (nextKey === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortKey(nextKey)
    setSortDirection('asc')
  }

  function openInternWorkspace(internId: string) {
    setSelectedInternId(internId)
    setCurrentInternId(internId)
    navigate('/intern')
  }

  return (
    <AppShell
      title="带教运营台｜节奏、反馈与干预中心"
      aside={
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
          {currentUser?.role === 'hr' ? '当前视角：全量查看' : `当前导师：${currentMentorName}`}
        </div>
      }
    >
      <SectionCard title="成员列表">
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
          <div className="hidden grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-3 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.25em] text-slate-400 lg:grid">
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
            {sortedMentorTeam.map((intern) => (
              <div
                key={intern.id}
                role="button"
                tabIndex={0}
                onClick={() => openInternWorkspace(intern.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openInternWorkspace(intern.id)
                  }
                }}
                className="grid cursor-pointer gap-3 bg-slate-950/40 px-4 py-4 text-left transition hover:bg-white/5 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr]"
              >
                <div>
                  <p className="font-medium text-white underline-offset-4 transition hover:text-cyan-200 hover:underline">
                    {intern.name}
                  </p>
                  <p className="text-sm text-slate-400">{intern.mentor}</p>
                </div>
                <p className="text-sm text-slate-300">{intern.role}</p>
                <p className="text-sm text-slate-300">第 {intern.week} 周 / {intern.stage}</p>
                <p className="text-sm text-slate-300">{intern.completionRate}%</p>
                <Pill tone={intern.riskLevel === '低风险' ? 'good' : intern.riskLevel === '中风险' ? 'warn' : 'bad'}>
                  {intern.riskLevel}
                </Pill>
                <div className="justify-self-start">
                  <Pill tone={intern.feedbackStatus === '已反馈' ? 'good' : 'warn'}>{intern.feedbackStatus}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <SectionCard title="本周待处理事项">
          <div className="space-y-4">
            {[
              `${lowProgressIntern.name} 本周任务完成率低于 70%，建议安排一次校准沟通。`,
              `${priorityIntern.name} 当前为团队重点关注对象，建议优先跟进风险原因。`,
              `当前还有 ${pendingFeedbackCount} 名成员未完成反馈闭环，请在本周内补齐。`,
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI 管理建议">
          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-5">
            <p className="text-sm leading-7 text-slate-100">
              {currentIntern.name} 本周任务完成率为 {currentIntern.completionRate}% ，当前适岗指数为 {currentIntern.fitScore}。
              其在周报与任务表现中呈现出“{currentIntern.reportTone}”的信号，说明当前更需要通过拆分任务、明确标准和增加同步来稳定节奏。
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {feedback.nextActions.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="反馈草稿生成">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">当前对象</p>
                <p className="mt-2 text-lg font-semibold text-white">{currentIntern.name}｜{currentIntern.role}</p>
                <p className="mt-2 text-sm text-slate-300">任务完成率 {currentIntern.completionRate}% ｜ 导师评分 {currentIntern.mentorScore}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-cyan-100">表现亮点</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {feedback.strengths.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-cyan-100">待提升点</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {feedback.improvements.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-[28px] border border-lime-300/20 bg-lime-300/10 p-5">
              <p className="text-sm font-medium text-lime-100">推荐反馈文案</p>
              <p className="mt-4 text-sm leading-7 text-slate-100">{feedback.fullFeedback}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
