import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, BarChart3 } from 'lucide-react'
import { SectionCard } from '@components/SectionCard'
import { ProjectCard } from '@components/ProjectCard'
import { Badge, EmptyState } from '@components/ui'
import type { AnalyticsResponse, Project } from '@utils/types'

const COLORS = ['#5b5cf0', '#22c55e', '#06b6d4', '#f59e0b', '#ec4899']

export function AnalyticsPage({ analytics, projects }: { analytics: AnalyticsResponse | null; projects: Project[] }) {
  return (
    <div className="grid gap-6">
      <SectionCard eyebrow="Clear analytics" title="لوحة Analytics" subtitle="رؤية أوضح لتوزيع المنصات وأعلى المشاريع تقييمًا داخل النظام.">
        <div className="mb-5 flex flex-wrap gap-2">
          <Badge>Visualized metrics</Badge>
          <Badge tone="emerald">Readable insights</Badge>
          <Badge tone="purple">Premium charts</Badge>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_340px]">
          <div className="h-80 rounded-[28px] border border-white/60 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.top_platforms || []} margin={{ top: 12, right: 12, left: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#5b5cf0" stopOpacity="1" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" vertical={false} />
                <XAxis dataKey="platform" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.08)' }} contentStyle={{ borderRadius: 16, border: '1px solid rgba(148,163,184,0.18)', background: 'rgba(15,23,42,0.92)', color: '#fff' }} />
                <Bar dataKey="count" fill="url(#chartFill)" radius={[14, 14, 0, 0]}>
                  {(analytics?.top_platforms || []).map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500"><BarChart3 size={22} /></div>
              <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">أفضل منصة حاليًا</h3>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{analytics?.top_platforms?.[0]?.platform || '—'}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">اعتمد عليها أكتر في الجولة الجاية من المحتوى.</p>
            </div>
            <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500"><Activity size={22} /></div>
              <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">مشاريع جاهزة للمراجعة</h3>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{projects.filter((project) => project.status !== 'draft').length}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">تابع المشاريع اللي وصلت لمرحلة نشر أو مخرجات كاملة.</p>
            </div>
          </div>
        </div>
      </SectionCard>
      <SectionCard eyebrow="Top scoring" title="أعلى المشاريع تقييمًا" subtitle="أسرع طريقة لفهم أي أسلوب أو niche بيحقق أقوى نتائج في المنصة.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...projects].sort((a, b) => b.viral_score - a.viral_score).slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} />)}
          {!projects.length ? <EmptyState title="لا توجد بيانات كفاية بعد" description="أول ما يتم إنشاء مشاريع وتوليد نتائج، هتظهر هنا أقوى المشاريع مرتبة بصريًا." icon={<BarChart3 size={22} />} /> : null}
        </div>
      </SectionCard>
    </div>
  )
}
