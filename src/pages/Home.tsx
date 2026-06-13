import { useMemo } from 'react'
import { ArrowRight, Bot, BriefcaseBusiness, FileText, Sparkles, Target, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { AppShell, SectionCard, StatCard } from '@/components/AppShell'
import { featuredIntern, interns } from '@/data/dashboardData'
import { useDashboardStore } from '@/store/useDashboardStore'

type HomeCard = {
  title: string
  to: string
  icon: typeof Sparkles
  accent: string
  badge: string
  detail: string
}

type HomeStat = {
  label: string
  value: string
  hint: string
  to: string
}

const flowItems = [
  '成员更新周进展与阻塞项',
  '系统识别阶段目标与岗位要求',
  '自动编排任务、建议与提醒',
  '导师在统一面板完成反馈闭环',
  'AI 生成风险判断与干预动作',
  'HR 从 cohort 看板查看整体趋势',
]

export default function Home() {
  const { currentUser, currentInternId, currentMentorName } = useDashboardStore()
  const currentIntern = interns.find((intern) => intern.id === currentInternId) ?? featuredIntern
  const mentorTeam = interns.filter((intern) => intern.mentor === currentMentorName)
  const homeStats = useMemo<HomeStat[]>(() => {
    const hrRiskCount = interns.filter((intern) => intern.riskLevel !== '低风险').length
    const hrHighPotentialCount = interns.filter((intern) => intern.fitScore >= 85).length
    const hrMentorCount = new Set(interns.map((intern) => intern.mentor)).size

    if (currentUser.role === 'intern') {
      return [
        { label: '当前阶段', value: `第 ${currentIntern.week} 周`, hint: currentIntern.stage, to: '/intern' },
        { label: '本周任务', value: `${currentIntern.tasks.length}`, hint: '查看我的任务', to: '/intern' },
        { label: '适岗指数', value: `${currentIntern.fitScore}`, hint: currentIntern.retentionAdvice, to: '/intern' },
        { label: '风险等级', value: currentIntern.riskLevel, hint: '查看 AI 风险判断', to: '/ai-center' },
        { label: '成长能量值', value: `${currentIntern.growthEnergy}`, hint: currentIntern.statusText, to: '/intern' },
        { label: '当前导师', value: currentIntern.mentor, hint: '查看带教上下文', to: '/intern' },
      ]
    }

    if (currentUser.role === 'mentor') {
      const averageCompletion = Math.round(
        mentorTeam.reduce((sum, intern) => sum + intern.completionRate, 0) / Math.max(mentorTeam.length, 1),
      )
      const riskCount = mentorTeam.filter((intern) => intern.riskLevel !== '低风险').length
      const pendingFeedback = mentorTeam.filter((intern) => intern.feedbackStatus === '未反馈').length

      return [
        { label: '团队人数', value: `${mentorTeam.length}`, hint: '查看成员列表', to: '/mentor' },
        { label: '平均完成率', value: `${averageCompletion}%`, hint: '查看带教进度', to: '/mentor' },
        { label: '待补反馈', value: `${pendingFeedback}`, hint: '前往反馈闭环', to: '/mentor' },
        { label: '风险对象', value: `${riskCount}`, hint: '前往风险跟进', to: '/mentor' },
        { label: '重点岗位', value: mentorTeam[0]?.role ?? '研发', hint: '查看当前团队结构', to: '/mentor' },
        { label: '本周动作', value: '1v1 + Review', hint: '前往 AI 建议', to: '/ai-center' },
      ]
    }

    return [
      { label: '成员总数', value: `${interns.length}`, hint: '前往成员工作台', to: '/intern' },
      { label: '导师总数', value: `${hrMentorCount}`, hint: '前往带教运营台', to: '/mentor' },
      { label: '风险对象', value: `${hrRiskCount}`, hint: '前往人才洞察台', to: '/hr' },
      { label: '高潜成员', value: `${hrHighPotentialCount}`, hint: '查看高潜名单', to: '/hr' },
      { label: '全量明细', value: '20 人', hint: '查看成员全量信息', to: '/hr' },
      { label: 'AI 输出', value: '群体总结', hint: '前往 AI Copilot', to: '/ai-center' },
    ]
  }, [currentIntern, currentUser, mentorTeam])
  const homeCards = useMemo<HomeCard[]>(() => {
    const mentorRiskCount = mentorTeam.filter((intern) => intern.riskLevel !== '低风险').length
    const mentorPendingFeedback = mentorTeam.filter((intern) => intern.feedbackStatus === '未反馈').length
    const hrMentorCount = new Set(interns.map((intern) => intern.mentor)).size
    const hrRiskCount = interns.filter((intern) => intern.riskLevel !== '低风险').length

    if (currentUser?.role === 'intern') {
      return [
        {
          title: '我的任务',
          to: '/intern',
          icon: Target,
          accent: 'from-cyan-400/20 to-blue-500/20',
          badge: `${currentIntern.tasks.length} 项`,
          detail: '查看本周任务与能力画像',
        },
        {
          title: '周进展',
          to: '/intern',
          icon: FileText,
          accent: 'from-emerald-400/18 to-cyan-500/18',
          badge: `第 ${currentIntern.week} 周`,
          detail: '填写周报并生成结构化输出',
        },
        {
          title: 'AI Copilot',
          to: '/ai-center',
          icon: Bot,
          accent: 'from-fuchsia-400/18 to-cyan-500/18',
          badge: currentIntern.riskLevel,
          detail: '获取成长建议与风险判断',
        },
      ]
    }

    if (currentUser?.role === 'mentor') {
      return [
        {
          title: '成员带教',
          to: '/mentor',
          icon: Users,
          accent: 'from-emerald-400/18 to-cyan-500/18',
          badge: `${mentorTeam.length} 人`,
          detail: '查看成员列表与当前状态',
        },
        {
          title: '反馈闭环',
          to: '/mentor',
          icon: FileText,
          accent: 'from-cyan-400/20 to-blue-500/20',
          badge: `${mentorPendingFeedback} 条`,
          detail: '生成反馈草稿并补齐反馈',
        },
        {
          title: '风险跟进',
          to: '/mentor',
          icon: Target,
          accent: 'from-indigo-400/18 to-violet-500/18',
          badge: `${mentorRiskCount} 人`,
          detail: '跟进重点成员与干预动作',
        },
        {
          title: 'AI Copilot',
          to: '/ai-center',
          icon: Bot,
          accent: 'from-fuchsia-400/18 to-cyan-500/18',
          badge: '带教建议',
          detail: '输出建议与反馈文案',
        },
      ]
    }

    return [
      {
        title: '成员工作台',
        to: '/intern',
        icon: Sparkles,
        accent: 'from-cyan-400/20 to-blue-500/20',
        badge: `${interns.length} 人`,
        detail: '全量查看成员成长与任务数据',
      },
      {
        title: '带教运营台',
        to: '/mentor',
        icon: Users,
        accent: 'from-emerald-400/18 to-cyan-500/18',
        badge: `${hrMentorCount} 位导师`,
        detail: '全量查看导师与成员带教情况',
      },
      {
        title: '人才洞察台',
        to: '/hr',
        icon: BriefcaseBusiness,
        accent: 'from-indigo-400/18 to-violet-500/18',
        badge: `${hrRiskCount} 风险`,
        detail: '查看 cohort 全景与全量明细',
      },
      {
        title: 'AI Copilot',
        to: '/ai-center',
        icon: Bot,
        accent: 'from-fuchsia-400/18 to-cyan-500/18',
        badge: '群体总结',
        detail: '生成群体分析与留用建议',
      },
    ]
  }, [currentIntern.riskLevel, currentIntern.tasks.length, currentIntern.week, currentUser?.role, mentorTeam])

  return (
    <AppShell
      title="实习能量站｜业务部实习生成长导航智能工具"
      aside={
        <Link
          to="/ai-center"
          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-300/20"
        >
          <Bot className="h-4 w-4" />
          体验 AI Copilot
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="核心工作台">
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {homeCards.map(({ title, to, icon: Icon, accent, badge, detail }) => (
              <Link
                key={title}
                to={to}
                className={`group rounded-[30px] border border-white/10 bg-gradient-to-br ${accent} p-[1px] transition hover:-translate-y-1`}
              >
                <div className="h-full rounded-[29px] bg-slate-950/90 p-5">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <Icon className="h-5 w-5 text-cyan-100" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
                  </div>
                  <p className="mt-10 text-xs uppercase tracking-[0.26em] text-cyan-300">{badge}</p>
                  <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="核心指标引擎">
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-300/10 p-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-100">Fit Score Engine</p>
              <p className="mt-3 text-sm leading-7 text-slate-100">
                适岗指数 = 任务完成度 × 30% + 导师评价 × 25% + 能力成长速度 × 20% + 主动学习表现 × 15% + 沟通协作反馈 × 10%
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                '85+：高潜人才，进入优先留用池',
                '70-84：稳定成长，适合继续培养',
                '60-69：表现波动，建议持续观察',
                '60 以下：高风险对象，需快速干预',
              ].map((rule) => (
                <div key={rule} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-200">
                  {rule}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {homeStats.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="rounded-[26px] transition-transform duration-200 hover:-translate-y-1"
          >
            <StatCard label={item.label} value={item.value} hint={item.hint} />
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <SectionCard title="运营闭环">
          <div className="grid gap-3">
            {flowItems.map((item, index) => (
              <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300/15 text-sm text-cyan-100">
                  0{index + 1}
                </div>
                <p className="text-sm text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </AppShell>
  )
}
