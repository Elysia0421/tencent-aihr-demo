import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AiAssistantCenter from '@/pages/AiAssistantCenter'
import Home from '@/pages/Home'
import HrDashboard from '@/pages/HrDashboard'
import InternDashboard from '@/pages/InternDashboard'
import LoginPage from '@/pages/LoginPage'
import MentorDashboard from '@/pages/MentorDashboard'
import { getDefaultRouteByRole, useDashboardStore, type WorkspaceRole } from '@/store/useDashboardStore'

function ProtectedRoute({
  allowedRoles,
  children,
}: {
  allowedRoles: WorkspaceRole[]
  children: JSX.Element
}) {
  const currentUser = useDashboardStore((state) => state.currentUser)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Navigate to={getDefaultRouteByRole(currentUser.role)} replace />
  }

  return children
}

function LoginRoute() {
  const currentUser = useDashboardStore((state) => state.currentUser)

  if (currentUser) {
    return <Navigate to={getDefaultRouteByRole(currentUser.role)} replace />
  }

  return <LoginPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={['intern', 'mentor', 'hr']}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intern"
          element={
            <ProtectedRoute allowedRoles={['intern', 'mentor', 'hr']}>
              <InternDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'hr']}>
              <MentorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr"
          element={
            <ProtectedRoute allowedRoles={['hr']}>
              <HrDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-center"
          element={
            <ProtectedRoute allowedRoles={['intern', 'mentor', 'hr']}>
              <AiAssistantCenter />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
