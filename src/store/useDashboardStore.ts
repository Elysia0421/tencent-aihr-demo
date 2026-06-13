import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { aiExamples, featuredIntern, interns, mentorFocusIntern } from '@/data/dashboardData'
import type { WeeklyReportInput } from '@/utils/ai'

export type WorkspaceRole = 'intern' | 'mentor' | 'hr'

export type CurrentUser = {
  id: string
  name: string
  role: WorkspaceRole
  internId?: string
  mentorName?: string
}

export type AccountPreset = {
  id: string
  name: string
  role: WorkspaceRole
  label: string
  description: string
  internId?: string
  mentorName?: string
}

type DashboardState = {
  currentUser: CurrentUser | null
  currentInternId: string
  currentMentorName: string
  selectedInternId: string
  selectedAiExampleId: string
  reportInput: WeeklyReportInput
  loginWithPreset: (presetId: string) => void
  logout: () => void
  setCurrentInternId: (internId: string) => void
  setSelectedInternId: (internId: string) => void
  setSelectedAiExampleId: (exampleId: string) => void
  updateReportField: (field: keyof WeeklyReportInput, value: string) => void
  resetReport: () => void
}

const initialReport: WeeklyReportInput = {
  completed: '竞品分析初稿，并参与一次需求评审会议',
  blockers: '对需求优先级判断还不够清晰',
  learned: '了解了需求评审流程和 PRD 核心结构',
  nextWeek: '继续学习 PRD 写作，并尝试独立输出一份需求文档',
}

const defaultMentorName = mentorFocusIntern.mentor

export const accountPresets: AccountPreset[] = [
  {
    id: 'intern-product-zhang',
    name: featuredIntern.name,
    role: 'intern',
    label: '成员账号',
    description: `${featuredIntern.role}方向｜第 ${featuredIntern.week} 周｜稳定成长`,
    internId: featuredIntern.id,
  },
  {
    id: 'intern-rnd-chen',
    name: interns[0].name,
    role: 'intern',
    label: '成员账号',
    description: `${interns[0].role}方向｜第 ${interns[0].week} 周｜高潜成长`,
    internId: interns[0].id,
  },
  {
    id: 'intern-sales-lin',
    name: interns[2].name,
    role: 'intern',
    label: '成员账号',
    description: `${interns[2].role}方向｜第 ${interns[2].week} 周｜稳定成长`,
    internId: interns[2].id,
  },
  {
    id: 'intern-rnd-li',
    name: interns[4].name,
    role: 'intern',
    label: '成员账号',
    description: `${interns[4].role}方向｜第 ${interns[4].week} 周｜需要聚焦`,
    internId: interns[4].id,
  },
  {
    id: 'intern-sales-wang',
    name: interns[5].name,
    role: 'intern',
    label: '成员账号',
    description: `${interns[5].role}方向｜第 ${interns[5].week} 周｜风险待干预`,
    internId: interns[5].id,
  },
  {
    id: 'mentor-li',
    name: '李导师',
    role: 'mentor',
    label: '导师账号',
    description: `负责 ${interns.filter((intern) => intern.mentor === '李导师').length} 名成员｜仅查看所带成员`,
    mentorName: '李导师',
  },
  {
    id: 'mentor-zhou',
    name: '周导师',
    role: 'mentor',
    label: '导师账号',
    description: `负责 ${interns.filter((intern) => intern.mentor === '周导师').length} 名成员｜仅查看所带成员`,
    mentorName: '周导师',
  },
  {
    id: 'hr-yang',
    name: '杨 HRBP',
    role: 'hr',
    label: 'HR 账号',
    description: '查看全量 cohort 数据、适岗趋势与风险分层',
  },
]

export function getDefaultRouteByRole(role: WorkspaceRole) {
  void role
  return '/'
}

function readStoredUser(): CurrentUser | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem('intern-energy-station-session')
    if (!raw) return null

    const parsed = JSON.parse(raw) as { state?: { currentUser?: CurrentUser | null } }
    return parsed.state?.currentUser ?? null
  } catch {
    return null
  }
}

function getSessionDefaults(currentUser: CurrentUser | null) {
  if (currentUser?.role === 'intern') {
    const currentIntern = interns.find((intern) => intern.id === currentUser.internId) ?? featuredIntern
    return {
      currentInternId: currentIntern.id,
      currentMentorName: currentIntern.mentor,
      selectedInternId: currentIntern.id,
    }
  }

  if (currentUser?.role === 'mentor') {
    const mentorName = currentUser.mentorName ?? defaultMentorName
    const team = interns.filter((intern) => intern.mentor === mentorName)
    return {
      currentInternId: featuredIntern.id,
      currentMentorName: mentorName,
      selectedInternId: team[0]?.id ?? featuredIntern.id,
    }
  }

  return {
    currentInternId: featuredIntern.id,
    currentMentorName: defaultMentorName,
    selectedInternId: featuredIntern.id,
  }
}

const storedUser = readStoredUser()
const sessionDefaults = getSessionDefaults(storedUser)

const initialState = {
  currentUser: storedUser,
  currentInternId: sessionDefaults.currentInternId,
  currentMentorName: sessionDefaults.currentMentorName,
  selectedInternId: sessionDefaults.selectedInternId,
  selectedAiExampleId: aiExamples[1].id,
  reportInput: initialReport,
}

function getLoggedOutState() {
  return {
    currentUser: null,
    currentInternId: featuredIntern.id,
    currentMentorName: defaultMentorName,
    selectedInternId: featuredIntern.id,
    selectedAiExampleId: aiExamples[1].id,
    reportInput: initialReport,
  }
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      ...initialState,
      loginWithPreset: (presetId) => {
        const preset = accountPresets.find((item) => item.id === presetId)
        if (!preset) return

        if (preset.role === 'intern') {
          const internId = preset.internId ?? featuredIntern.id
          const currentIntern = interns.find((intern) => intern.id === internId) ?? featuredIntern
          set({
            currentUser: {
              id: preset.id,
              name: preset.name,
              role: preset.role,
              internId,
            },
            currentInternId: currentIntern.id,
            currentMentorName: currentIntern.mentor,
            selectedInternId: currentIntern.id,
          })
          return
        }

        if (preset.role === 'mentor') {
          const mentorName = preset.mentorName ?? defaultMentorName
          const team = interns.filter((intern) => intern.mentor === mentorName)
          set({
            currentUser: {
              id: preset.id,
              name: preset.name,
              role: preset.role,
              mentorName,
            },
            currentInternId: team[0]?.id ?? featuredIntern.id,
            currentMentorName: mentorName,
            selectedInternId: team[0]?.id ?? featuredIntern.id,
          })
          return
        }

        set({
          currentUser: {
            id: preset.id,
            name: preset.name,
            role: preset.role,
          },
          currentInternId: featuredIntern.id,
          currentMentorName: defaultMentorName,
          selectedInternId: featuredIntern.id,
        })
      },
      logout: () =>
        set({
          ...getLoggedOutState(),
        }),
      setCurrentInternId: (currentInternId) => set({ currentInternId }),
      setSelectedInternId: (selectedInternId) => set({ selectedInternId }),
      setSelectedAiExampleId: (selectedAiExampleId) => set({ selectedAiExampleId }),
      updateReportField: (field, value) =>
        set((state) => ({
          reportInput: {
            ...state.reportInput,
            [field]: value,
          },
        })),
      resetReport: () => set({ reportInput: initialReport }),
    }),
    {
      name: 'intern-energy-station-session',
    },
  ),
)
