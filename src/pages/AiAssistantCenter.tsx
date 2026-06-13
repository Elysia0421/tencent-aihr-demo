import { useMemo } from 'react'
import { Bot, ShieldAlert, Sparkles } from 'lucide-react'

import { AppShell, SectionCard } from '@/components/AppShell'
import { featuredIntern, interns } from '@/data/dashboardData'
import { useDashboardStore } from '@/store/useDashboardStore'
import {
  generateHrCopilotExamples,
  generateInternCopilotExamples,
  generateMentorCopilotExamples,
  getRiskKeywords,
} from '@/utils/ai'

export default function AiAssistantCenter() {
  const { currentUser, currentInternId, selectedAiExampleId, setSelectedAiExampleId, reportInput } = useDashboardStore()
  const currentIntern = interns.find((intern) => intern.id === currentInternId) ?? featuredIntern
  const currentRole = currentUser?.role ?? 'intern'
  const examples = useMemo(() => {
    if (currentRole === 'intern') return generateInternCopilotExamples(currentIntern, reportInput)
    if (currentRole === 'mentor') return generateMentorCopilotExamples(currentIntern)
    return generateHrCopilotExamples(interns)
  }, [currentIntern, currentRole, reportInput])
  const selectedExample = examples.find((item) => item.id === selectedAiExampleId) ?? examples[0]
  const promptCards = useMemo(() => {
    if (currentRole === 'intern') {
      return [
        {
          title: '成长计划 Prompt',
          content: `请你作为${currentIntern.role}方向业务导师，基于 ${currentIntern.name} 当前阶段、任务列表、能力画像、风险等级与适岗情况，输出更贴合其个人节奏的本周成长重点、优先任务和执行建议。`,
        },
        {
          title: '周报生成 Prompt',
          content: `请你将 ${currentIntern.name} 填写的本周完成内容、问题、收获和下周计划整理为结构化周报，保留其当前阶段最关键的任务结果、阻塞与下周目标，语气真实、简洁、可直接提交。`,
        },
        {
          title: '风险识别 Prompt',
          content: `请结合 ${currentIntern.name} 的任务完成率、周报文本、延期次数、沟通频率和当前能力短板，判断其风险等级，并输出三条可执行改进建议。`,
        },
      ]
    }

    if (currentRole === 'mentor') {
      return [
        {
          title: '反馈生成 Prompt',
          content: `请你作为带教导师，基于 ${currentIntern.name} 的任务完成率、能力表现、周报信号、学生画像和导师评分，生成客观、具体、鼓励性强的反馈。`,
        },
        {
          title: '风险分析 Prompt',
          content: `请分析 ${currentIntern.name} 的风险来源，并输出导师本周需要执行的跟进动作，包括沟通、任务拆解和同步安排。`,
        },
        {
          title: '带教动作 Prompt',
          content: `请基于 ${currentIntern.name} 当前阶段、能力短板和风险等级，输出下周带教节奏安排，包括周初、周中、周末三个时间点的动作建议。`,
        },
      ]
    }

    return [
      {
        title: '群体总结 Prompt',
        content: '请你作为 HRBP，基于 cohort 的完成率、适岗指数、岗位差异和风险分层，输出一段整体趋势判断与下周管理建议。',
      },
      {
        title: '留用建议 Prompt',
        content: '请结合适岗指数、导师评价、成长速度和风险情况，将成员划分为推荐留用、继续培养、需要观察三层。',
      },
      {
        title: '风险名单 Prompt',
        content: '请识别当前 cohort 中的高风险对象，并输出触发原因、建议动作和是否需要 HR 介入。',
      },
    ]
  }, [currentIntern.name, currentIntern.role, currentRole])
  const logicItems = currentRole === 'hr'
    ? ['任务完成率', '导师评分', '能力成长速度', '主动学习表现', '沟通协作反馈', ...getRiskKeywords()]
    : currentRole === 'mentor'
      ? ['任务完成率', '导师评分', '阶段目标', '反馈状态', '延期次数', ...getRiskKeywords()]
      : ['本周任务', '能力短板', '适岗指数', '成长能量', ...getRiskKeywords()]
  const roleTitle =
    currentRole === 'intern'
      ? '个人成长与周报辅助'
      : currentRole === 'mentor'
        ? '带教反馈与风险干预'
        : '群体洞察与留用判断'
  const roleTag =
    currentRole === 'intern' ? '成员视角' : currentRole === 'mentor' ? '导师视角' : 'HR 视角'
  const scenarioTitle =
    currentRole === 'intern' ? `我的 AI 能力｜${currentIntern.name}` : currentRole === 'mentor' ? `当前成员 AI 能力｜${currentIntern.name}` : 'HR AI 能力'
  const focusBadges = currentRole === 'hr'
    ? [
        `${interns.length} 名成员`,
        `${interns.filter((intern) => intern.riskLevel === '高风险').length} 名高风险`,
        `${interns.filter((intern) => intern.fitScore >= 85).length} 名高潜`,
      ]
    : [
        currentIntern.role,
        `第 ${currentIntern.week} 周`,
        currentIntern.stage,
        currentIntern.statusText,
        `适岗 ${currentIntern.fitScore}`,
      ]

  return (
    <AppShell
      title={`AI Copilot｜${roleTitle}`}
      aside={
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
          <Bot className="h-4 w-4 text-cyan-200" />
          {currentUser?.name}｜{roleTag}
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title={scenarioTitle}>
          <div className="mb-4 flex flex-wrap gap-3">
            {focusBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {badge}
              </span>
            ))}
          </div>
          <div className="space-y-3">
            {examples.map((example) => (
              <button
                key={example.id}
                type="button"
                onClick={() => setSelectedAiExampleId(example.id)}
                className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  selectedExample.id === example.id
                    ? 'border-cyan-300/50 bg-cyan-300/15'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-medium text-white">{example.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{example.context}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="AI 输出结果">
          <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <Sparkles className="h-5 w-5 text-cyan-100" />
              </div>
              <div>
                <p className="text-sm text-cyan-100">{selectedExample.title}</p>
                <h3 className="text-xl font-semibold text-white">{selectedExample.output.headline}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedExample.context}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
                <p className="text-sm font-medium text-cyan-100">关键判断</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {selectedExample.output.points.map((point) => <li key={point}>- {point}</li>)}
                </ul>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-slate-950/55 p-5">
                <p className="text-sm font-medium text-cyan-100">建议动作</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">
                  {selectedExample.output.actions.map((action) => <li key={action}>- {action}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Prompt 设计">
          <div className="space-y-4">
            {promptCards.map((prompt) => (
              <div key={prompt.title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-medium text-cyan-100">{prompt.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-200">{prompt.content}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="识别依据">
          <div className="rounded-[28px] border border-lime-300/20 bg-lime-300/10 p-6">
            <div className="flex items-center gap-2 text-sm text-lime-100">
              <ShieldAlert className="h-4 w-4" />
              当前输出会结合角色权限和可见数据范围进行判断
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {logicItems.map((keyword) => (
                <span key={keyword} className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-100">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
