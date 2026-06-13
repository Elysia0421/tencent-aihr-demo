import { useMemo, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { Navigate, useNavigate } from 'react-router-dom'

import { accountPresets, getDefaultRouteByRole, useDashboardStore, type WorkspaceRole } from '@/store/useDashboardStore'

const roleOptions: { role: WorkspaceRole; label: string; icon: typeof Sparkles }[] = [
  { role: 'intern', label: '成员登录', icon: Sparkles },
  { role: 'mentor', label: '导师登录', icon: Users },
  { role: 'hr', label: 'HR 登录', icon: BriefcaseBusiness },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { currentUser, loginWithPreset } = useDashboardStore()
  const [selectedRole, setSelectedRole] = useState<WorkspaceRole>('intern')
  const availableAccounts = useMemo(
    () => accountPresets.filter((account) => account.role === selectedRole),
    [selectedRole],
  )
  const [selectedPresetId, setSelectedPresetId] = useState(availableAccounts[0]?.id ?? '')

  if (currentUser) {
    return <Navigate to={getDefaultRouteByRole(currentUser.role)} replace />
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-12%] h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-6%] h-96 w-96 rounded-full bg-indigo-500/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_26%),radial-gradient(circle_at_right,_rgba(99,102,241,0.1),_transparent_24%),linear-gradient(180deg,rgba(7,17,31,0.96),rgba(7,17,31,1))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[34px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-100">
              <ShieldCheck className="h-4 w-4" />
              登录
            </div>
            <h1 className="mt-6 font-display text-4xl text-white sm:text-5xl">实习能量站</h1>
            <div className="mt-8 overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/45">
              <img
                src="https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20penguin%20mascot%20for%20a%20corporate%20AI%20internship%20dashboard%2C%20friendly%20black%20and%20white%20penguin%20character%2C%20subtle%20blue%20scarf%2C%20standing%20beside%20a%20futuristic%20holographic%20data%20panel%2C%20premium%20tech%20branding%2C%20clean%203d%20illustration%2C%20dark%20navy%20background%2C%20cinematic%20soft%20lighting%2C%20high%20detail&image_size=portrait_4_3"
                alt="企鹅风格的智能助手插图"
                className="h-[320px] w-full object-cover"
              />
            </div>
          </section>

          <section className="rounded-[34px] border border-white/10 bg-slate-950/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.38)] backdrop-blur-xl sm:p-8">
            <h2 className="mt-4 text-2xl font-semibold text-white">选择身份并进入系统</h2>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {roleOptions.map(({ role, label, icon: Icon }) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => {
                    setSelectedRole(role)
                    const nextAccounts = accountPresets.filter((account) => account.role === role)
                    setSelectedPresetId(nextAccounts[0]?.id ?? '')
                  }}
                  className={`rounded-[26px] border p-4 text-left transition ${
                    selectedRole === role
                      ? 'border-cyan-300/45 bg-cyan-300/12'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="rounded-2xl bg-white/10 p-3 w-fit">
                    <Icon className="h-5 w-5 text-cyan-100" />
                  </div>
                  <p className="mt-5 text-base font-medium text-white">{label}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {availableAccounts.map((account) => (
                <button
                  type="button"
                  key={account.id}
                  onClick={() => setSelectedPresetId(account.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition ${
                    selectedPresetId === account.id
                      ? 'border-cyan-300/50 bg-cyan-300/12'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-cyan-100">{account.label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{account.name}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{account.description}</p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                      {account.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                if (!selectedPresetId) return
                const preset = accountPresets.find((item) => item.id === selectedPresetId)
                if (!preset) return
                loginWithPreset(selectedPresetId)
                navigate(getDefaultRouteByRole(preset.role))
              }}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-300/35 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-cyan-50 transition hover:bg-cyan-300/20"
            >
              进入系统
              <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        </div>
      </div>
    </div>
  )
}
