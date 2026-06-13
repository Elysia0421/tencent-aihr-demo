import { NavLink, useNavigate } from 'react-router-dom'
import type { PropsWithChildren, ReactNode } from 'react'
import { Activity, Bot, BriefcaseBusiness, House, LogOut, Sparkles, Users } from 'lucide-react'

import { useDashboardStore } from '@/store/useDashboardStore'

const navigationItems = [
  { to: '/', label: '首页', icon: House, roles: ['intern', 'mentor', 'hr'] },
  { to: '/intern', label: '成员工作台', icon: Sparkles, roles: ['intern', 'mentor', 'hr'] },
  { to: '/mentor', label: '带教运营台', icon: Users, roles: ['mentor', 'hr'] },
  { to: '/hr', label: '人才洞察台', icon: BriefcaseBusiness, roles: ['hr'] },
  { to: '/ai-center', label: 'AI Copilot', icon: Bot, roles: ['intern', 'mentor', 'hr'] },
]

type ShellProps = PropsWithChildren<{
  title: string
  subtitle?: string
  eyebrow?: string
  aside?: ReactNode
}>

export function AppShell({ title, subtitle, eyebrow, aside, children }: ShellProps) {
  const navigate = useNavigate()
  const { currentUser, logout } = useDashboardStore()
  const roleLabel =
    currentUser?.role === 'intern' ? '成员' : currentUser?.role === 'mentor' ? '导师' : currentUser?.role === 'hr' ? 'HR' : ''
  const visibleNavigationItems = navigationItems.filter(
    (item) => currentUser && item.roles.includes(currentUser.role),
  )

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-15%] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_right,_rgba(99,102,241,0.12),_transparent_22%),linear-gradient(180deg,rgba(7,17,31,0.95),rgba(7,17,31,1))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[32px] border border-white/10 bg-white/5 px-5 py-5 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-300/10">
                <Activity className="h-5 w-5 text-cyan-100" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">实习能量站</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser ? (
                <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-xs text-lime-100">
                  {roleLabel}账号｜{currentUser.name}
                </span>
              ) : null}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  退出登录
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {eyebrow ? <p className="text-xs uppercase tracking-[0.36em] text-cyan-300">{eyebrow}</p> : null}
              <h1 className="mt-3 font-display text-3xl text-white sm:text-4xl">{title}</h1>
              {subtitle ? (
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{subtitle}</p>
              ) : null}
            </div>
            {aside ? aside : null}
          </div>
        </header>

        <nav className="mb-8 flex flex-wrap gap-3">
          {visibleNavigationItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200',
                  isActive
                    ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.14)]'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-white',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: PropsWithChildren<{ title: string; description?: string; action?: ReactNode }>) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-[0.01em] text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/5 p-5 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/10">
      <p className="text-[11px] uppercase tracking-[0.26em] text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-2 text-xs leading-5 text-cyan-200">{hint}</p> : null}
    </div>
  )
}

export function Pill({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'good' | 'warn' | 'bad' }>) {
  const toneClass =
    tone === 'good'
      ? 'bg-lime-400/15 text-lime-200'
      : tone === 'warn'
        ? 'bg-amber-400/15 text-amber-200'
        : tone === 'bad'
          ? 'bg-rose-400/15 text-rose-200'
          : 'bg-cyan-400/15 text-cyan-100'

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs ${toneClass}`}>{children}</span>
}
