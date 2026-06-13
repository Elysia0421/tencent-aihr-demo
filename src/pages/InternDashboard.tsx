import { useMemo } from 'react'
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, ResponsiveContainer } from 'recharts'

import { AppShell, Pill, SectionCard } from '@/components/AppShell'
import { featuredIntern, interns } from '@/data/dashboardData'
import { useDashboardStore } from '@/store/useDashboardStore'
import { generateGrowthSuggestion, generateWeeklyReport } from '@/utils/ai'

export default function InternDashboard() {
  const { currentInternId, currentMentorName, currentUser, reportInput, updateReportField, resetReport, setCurrentInternId } =
    useDashboardStore()
  const viewableInterns =
    currentUser?.role === 'hr'
      ? interns
      : currentUser?.role === 'mentor'
        ? interns.filter((intern) => intern.mentor === currentMentorName)
        : interns.filter((intern) => intern.id === currentInternId)
  const currentIntern = interns.find((intern) => intern.id === currentInternId) ?? featuredIntern

  const radarData = Object.entries(currentIntern.abilities).map(([subject, score]) => ({
    subject,
    score,
    fullMark: 5,
  }))

  const reportOutput = useMemo(
    () => generateWeeklyReport(currentIntern, reportInput),
    [currentIntern, reportInput],
  )

  return (
    <AppShell
      title="成员工作台｜个人成长与交付中心"
      aside={
        currentUser?.role === 'intern' ? (
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white">
            当前账号：{currentIntern.name}
          </div>
        ) : (
          <select
            value={currentIntern.id}
            onChange={(event) => setCurrentInternId(event.target.value)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
          >
            {viewableInterns.map((intern) => (
              <option key={intern.id} value={intern.id} className="bg-slate-950">
                {intern.name}｜{intern.role}｜{intern.mentor}
              </option>
            ))}
          </select>
        )
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionCard title="成长概览">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              ['姓名', currentIntern.name],
              ['岗位', `${currentIntern.role}实习生`],
              ['当前阶段', `第 ${currentIntern.week} 周 / ${currentIntern.stage}`],
              ['成长能量值', `${currentIntern.growthEnergy} / 100`],
              ['当前状态', currentIntern.statusText],
              ['适岗指数', `${currentIntern.fitScore}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI 建议摘要">
          <div className="rounded-[24px] border border-cyan-300/20 bg-cyan-300/10 p-5">
            <Pill tone={currentIntern.riskLevel === '低风险' ? 'good' : currentIntern.riskLevel === '中风险' ? 'warn' : 'bad'}>
              {currentIntern.riskLevel}
            </Pill>
            <p className="mt-4 text-sm leading-7 text-slate-100">{generateGrowthSuggestion(currentIntern)}</p>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <SectionCard title="本周优先级">
          <div className="space-y-4">
            {currentIntern.tasks.map((task) => (
              <div key={task.id} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <Pill>{task.category}</Pill>
                      <Pill tone={task.status === '已完成' ? 'good' : task.status === '进行中' ? 'warn' : 'neutral'}>
                        {task.status}
                      </Pill>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{task.title}</h3>
                  </div>
                  <div className="text-sm text-slate-300">Deadline：{task.deadline}</div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">{task.aiHint}</div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">{task.relatedAbility}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="能力画像">
          <div className="h-[360px] rounded-[24px] border border-white/10 bg-white/5 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#dbeafe', fontSize: 12 }} />
                <Radar
                  name="能力评分"
                  dataKey="score"
                  stroke="#67e8f9"
                  fill="#22d3ee"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6">
        <SectionCard title="周进展生成器">
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-4">
              {[
                ['completed', '本周完成事项'],
                ['blockers', '当前阻塞与问题'],
                ['learned', '关键收获'],
                ['nextWeek', '下周推进计划'],
              ].map(([field, label]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm text-slate-300">{label}</span>
                  <textarea
                    value={reportInput[field as keyof typeof reportInput]}
                    onChange={(event) =>
                      updateReportField(field as keyof typeof reportInput, event.target.value)
                    }
                    rows={3}
                    className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                  />
                </label>
              ))}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetReport}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                >
                  恢复默认内容
                </button>
              </div>
            </div>

            <div className="space-y-4 rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">结构化输出</h3>
                <Pill tone={reportOutput.riskLevel === '低风险' ? 'good' : reportOutput.riskLevel === '中风险' ? 'warn' : 'bad'}>
                  {reportOutput.riskLevel}
                </Pill>
              </div>
              <p className="text-sm leading-7 text-slate-100">{reportOutput.summary}</p>
              <div>
                <p className="text-sm font-medium text-cyan-100">进展亮点</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {reportOutput.highlights.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-100">风险与关注点</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {reportOutput.risks.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-100">下一步建议</p>
                <ul className="mt-2 space-y-2 text-sm text-slate-200">
                  {reportOutput.suggestions.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
