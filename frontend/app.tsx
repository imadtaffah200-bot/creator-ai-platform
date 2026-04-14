import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@components/AppShell'
import { AuthPage } from '@pages/AuthPage'
import { DashboardPage } from '@pages/DashboardPage'
import { StudioPage } from '@pages/StudioPage'
import { TrendsPage } from '@pages/TrendsPage'
import { ProjectsPage } from '@pages/ProjectsPage'
import { AssistantPage } from '@pages/AssistantPage'
import { AnalyticsPage } from '@pages/AnalyticsPage'

import { api, authStorage, setAuthToken } from '@utils/api'
import type { AnalyticsResponse, Project, User } from '@utils/types'

export type TabKey =
  | 'dashboard'
  | 'studio'
  | 'trends'
  | 'projects'
  | 'assistant'
  | 'analytics'

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('creator-theme')
    return (saved as 'light' | 'dark') || 'dark'
  })

  const [token, setToken] = useState<string | null>(() => authStorage.getToken())
  const [user, setUser] = useState<User | null>(null)
  const [tab, setTab] = useState<TabKey>('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('dir', 'rtl')
    document.documentElement.lang = 'ar'
    localStorage.setItem('creator-theme', theme)
  }, [theme])

  const loadInitial = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    setAuthToken(token)

    try {
      const [meRes, projectsRes, analyticsRes] = await Promise.all([
        api.get('/api/auth/me'),
        api.get('/api/projects'),
        api.get('/api/analytics/dashboard')
      ])

      setUser(meRes.data)
      setProjects(projectsRes.data)
      setAnalytics(analyticsRes.data)
    } catch (error) {
      authStorage.clear()
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInitial()
  }, [token])

  const refreshProjects = async () => {
    if (!token) return
    const res = await api.get('/api/projects')
    setProjects(res.data)
  }

  const refreshAnalytics = async () => {
    if (!token) return
    const res = await api.get('/api/analytics/dashboard')
    setAnalytics(res.data)
  }

  const refreshAll = async () => {
    await Promise.all([refreshProjects(), refreshAnalytics()])
  }

  const content = useMemo(() => {
    if (!user) return null

    switch (tab) {
      case 'dashboard':
        return (
          <DashboardPage
            projects={projects}
            analytics={analytics}
            onRefresh={refreshAll}
            onOpenStudio={() => setTab('studio')}
          />
        )

      case 'studio':
        return <StudioPage projects={projects} onRefresh={refreshAll} />

      case 'trends':
        return <TrendsPage />

      case 'projects':
        return <ProjectsPage projects={projects} onRefresh={refreshAll} />

      case 'assistant':
        return <AssistantPage />

      case 'analytics':
        return <AnalyticsPage analytics={analytics} projects={projects} />

      default:
        return null
    }
  }, [tab, user, projects, analytics])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        جارٍ تحميل المنصة...
      </div>
    )
  }

  if (!token || !user) {
    return (
      <AuthPage
        onAuthenticated={(nextToken, nextUser) => {
          authStorage.setToken(nextToken)
          setAuthToken(nextToken)
          setToken(nextToken)
          setUser(nextUser)
        }}
      />
    )
  }

  return (
    <AppShell
      user={user}
      theme={theme}
      tab={tab}
      onTabChange={setTab}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onLogout={() => {
        authStorage.clear()
        setAuthToken(null)
        setToken(null)
        setUser(null)
      }}
    >
      {content}
    </AppShell>
  )
}
