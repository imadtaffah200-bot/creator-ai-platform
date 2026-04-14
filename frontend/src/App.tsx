import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { AppShell } from '@components/AppShell'
import { AuthPage } from '@pages/AuthPage'
import { DashboardPage } from '@pages/DashboardPage'
import { StudioPage } from '@pages/StudioPage'
import { TrendsPage } from '@pages/TrendsPage'
import { ProjectsPage } from '@pages/ProjectsPage'
import { AssistantPage } from '@pages/AssistantPage'
import { AnalyticsPage } from '@pages/AnalyticsPage'
import { authStorage, setAuthToken, api } from '@utils/api'
import { requestState } from '@utils/requestState'
import { Skeleton } from '@components/ui'
import type { AnalyticsResponse, Project, User } from '@utils/types'
import { getErrorMessage } from '@utils/helpers'

export type TabKey = 'dashboard' | 'studio' | 'trends' | 'projects' | 'assistant' | 'analytics'

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
  const [pendingRequests, setPendingRequests] = useState(0)

  useEffect(() => requestState.subscribe(setPendingRequests), [])

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
        api.get('/api/analytics/dashboard'),
      ])
      setUser(meRes.data)
      setProjects(projectsRes.data)
      setAnalytics(analyticsRes.data)
    } catch (error) {
      authStorage.clear()
      setToken(null)
      setUser(null)
      toast.error(getErrorMessage(error, 'انتهت الجلسة أو تعذر تحميل بياناتك'))
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
    toast.success('تم تحديث البيانات بنجاح')
  }

  const content = useMemo(() => {
    if (!user) return null
    switch (tab) {
      case 'dashboard':
        return <DashboardPage projects={projects} analytics={analytics} onRefresh={refreshAll} onOpenStudio={() => setTab('studio')} />
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
      <div className="min-h-screen bg-app p-6 text-slate-900 dark:text-slate-100">
        <div className="mx-auto grid max-w-[1480px] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="h-[85vh] rounded-[32px]" />
          <div className="grid gap-6">
            <Skeleton className="h-28 rounded-[32px]" />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-[30px]" />)}
            </div>
            <Skeleton className="h-[48vh] rounded-[32px]" />
          </div>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return <AuthPage onAuthenticated={(nextToken, nextUser) => {
      authStorage.setToken(nextToken)
      setAuthToken(nextToken)
      setToken(nextToken)
      setUser(nextUser)
      toast.success(`أهلاً ${nextUser.full_name}، المنصة جاهزة ليك ✨`)
    }} />
  }

  return (
    <AppShell
      user={user}
      theme={theme}
      tab={tab}
      pendingRequests={pendingRequests}
      onTabChange={setTab}
      onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      onLogout={() => {
        authStorage.clear()
        setAuthToken(null)
        setToken(null)
        setUser(null)
        toast('تم تسجيل الخروج بأمان')
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
          className="grid gap-6"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
