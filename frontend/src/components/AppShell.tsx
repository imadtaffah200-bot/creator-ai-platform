import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BarChart3, Bot, ChevronLeft, Home, LogOut, Menu, MoonStar, PanelRightClose, PanelRightOpen, Sparkles, SunMedium, TrendingUp, Video, X } from 'lucide-react'
import type { PropsWithChildren, ReactNode } from 'react'
import type { AppTab, User } from '@utils/types'
import { cls } from '@utils/helpers'
import { Badge, Button } from './ui'

const NAV_ITEMS: { key: AppTab; label: string; description: string; icon: ReactNode }[] = [
  { key: 'dashboard', label: 'لوحة التحكم', description: 'رؤية شاملة وسريعة', icon: <Home size={18} /> },
  { key: 'studio', label: 'AI Studio', description: 'إنشاء المحتوى خطوة بخطوة', icon: <Video size={18} /> },
  { key: 'trends', label: 'الترندات', description: 'استكشاف الفرص الساخنة', icon: <TrendingUp size={18} /> },
  { key: 'projects', label: 'المشاريع', description: 'إدارة الأصول والملفات', icon: <Sparkles size={18} /> },
  { key: 'assistant', label: 'المساعد', description: 'محادثة وتحسين السكربت', icon: <Bot size={18} /> },
  { key: 'analytics', label: 'Analytics', description: 'قياس الأداء والوضوح', icon: <BarChart3 size={18} /> },
]

export function AppShell({ user, theme, tab, pendingRequests, onTabChange, onToggleTheme, onLogout, children }: PropsWithChildren<{ user: User; theme: 'light' | 'dark'; tab: AppTab; pendingRequests: number; onTabChange: (key: AppTab) => void; onToggleTheme: () => void; onLogout: () => void }>) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const activeItem = useMemo(() => NAV_ITEMS.find((item) => item.key === tab), [tab])

  const navContent = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className={cls('flex items-center gap-3', collapsed && 'lg:justify-center')}>
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#5b5cf0_0%,#7c3aed_100%)] text-white shadow-[0_14px_40px_rgba(91,92,240,0.35)]">
            <img src="/favicon.svg" alt="logo" className="h-8 w-8" />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-lg font-black text-slate-950 dark:text-white">Creator AI</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">منصة صناعة محتوى عربية بمعايير SaaS</p>
            </div>
          ) : null}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="hidden h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-indigo-400/40 dark:hover:text-indigo-300 lg:inline-flex">
          {collapsed ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
        </button>
      </div>

      <div className="mt-8 rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(91,92,240,0.14)_0%,rgba(6,182,212,0.1)_100%)] p-4 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(91,92,240,0.15)_0%,rgba(15,23,42,0.35)_100%)]">
        <div className={cls('flex items-center gap-3', collapsed && 'lg:justify-center')}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-lg font-black text-indigo-600 dark:bg-white/10 dark:text-indigo-300">{user.full_name.slice(0, 1)}</div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">جاهز للإطلاق</p>
              <p className="truncate text-lg font-black text-slate-950 dark:text-white">{user.full_name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          ) : null}
        </div>
        {!collapsed ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Premium UI</Badge>
            <Badge tone="emerald">RTL Ready</Badge>
            <Badge tone="purple">AI Workflow</Badge>
          </div>
        ) : null}
      </div>

      <nav className="mt-6 grid gap-2">
        {NAV_ITEMS.map((item, index) => {
          const isActive = tab === item.key
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => {
                onTabChange(item.key)
                setMobileMenuOpen(false)
              }}
              className={cls(
                'group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-right transition-all duration-200',
                isActive
                  ? 'bg-[linear-gradient(135deg,#5b5cf0_0%,#7c3aed_100%)] text-white shadow-[0_16px_38px_rgba(91,92,240,0.3)]'
                  : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white',
                collapsed && 'lg:justify-center lg:px-0',
              )}
            >
              <span className={cls('flex h-10 w-10 items-center justify-center rounded-2xl transition', isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-white/5 dark:text-slate-300 dark:group-hover:bg-indigo-500/10 dark:group-hover:text-indigo-300')}>
                {item.icon}
              </span>
              {!collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black">{item.label}</span>
                  <span className={cls('block truncate text-xs', isActive ? 'text-white/80' : 'text-slate-400 dark:text-slate-500')}>{item.description}</span>
                </span>
              ) : null}
              {!collapsed && isActive ? <ChevronLeft size={16} className="shrink-0" /> : null}
            </motion.button>
          )
        })}
      </nav>

      <div className="mt-auto grid gap-3 pt-6">
        <Button variant="secondary" onClick={onToggleTheme} className={cls(collapsed && 'lg:px-0')}>
          {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
          {!collapsed ? (theme === 'dark' ? 'تشغيل الوضع الفاتح' : 'تشغيل الوضع الداكن') : null}
        </Button>
        <Button variant="danger" onClick={onLogout} className={cls(collapsed && 'lg:px-0')}>
          <LogOut size={18} />
          {!collapsed ? 'تسجيل الخروج' : null}
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-app text-slate-900 transition-colors dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-[-8%] top-[-10%] h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl dark:bg-fuchsia-500/15" />
        <div className="absolute bottom-[-8%] left-[-4%] h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10" />
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        ) : null}
      </AnimatePresence>

      <div className="relative mx-auto grid min-h-screen max-w-[1600px] grid-cols-1 gap-6 p-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:p-6">
        <AnimatePresence>
          {mobileMenuOpen ? (
            <motion.aside initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} className="fixed inset-y-4 right-4 z-50 flex w-[86vw] max-w-sm flex-col rounded-[32px] border border-white/60 bg-white/95 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/95 lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-black">القائمة</p>
                <button onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10"><X size={18} /></button>
              </div>
              {navContent}
            </motion.aside>
          ) : null}
        </AnimatePresence>

        <aside className={cls('hidden min-h-[calc(100vh-3rem)] flex-col rounded-[32px] border border-white/60 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] lg:flex', collapsed ? 'w-[104px]' : 'w-[300px]')}>
          {navContent}
        </aside>

        <main className="min-w-0">
          <div className="mb-6 rounded-[30px] border border-white/60 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
              <button onClick={() => setMobileMenuOpen(true)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 dark:border-white/10 dark:bg-white/5">
                <Menu size={18} />
              </button>
              <Badge tone="slate">{activeItem?.label}</Badge>
            </div>

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge>{activeItem?.label}</Badge>
                  <Badge tone="slate">{pendingRequests > 0 ? `${pendingRequests} طلب شغال` : 'جاهز'} </Badge>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white md:text-4xl">تجربة احترافية لصناعة المحتوى العربي</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">لوحة حديثة، تفاعل سلس، وتجربة إنتاج مرئية توصل المشروع لمستوى SaaS Premium من غير ما نكسر أي وظيفة موجودة.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[350px]">
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-xs text-slate-400">الوضع الحالي</p>
                  <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-xs text-slate-400">التبويب النشط</p>
                  <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{activeItem?.label}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
              <motion.div animate={{ width: pendingRequests > 0 ? '68%' : '26%' }} transition={{ repeat: pendingRequests > 0 ? Infinity : 0, duration: 1.2, ease: 'easeInOut' }} className="h-full rounded-full bg-[linear-gradient(90deg,#5b5cf0_0%,#22d3ee_100%)]" />
            </div>
          </div>

          <div className="grid gap-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
