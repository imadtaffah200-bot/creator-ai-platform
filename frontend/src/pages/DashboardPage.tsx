import { Activity, ArrowLeft, BarChart3, FolderKanban, Rocket, Sparkles, Zap } from 'lucide-react'
import { SectionCard } from '@components/SectionCard'
import { StatCard } from '@components/StatCard'
import { ProjectCard } from '@components/ProjectCard'
import { Badge, Button, EmptyState } from '@components/ui'
import type { AnalyticsResponse, Project } from '@utils/types'
import { averageScoreLabel } from '@utils/helpers'

export function DashboardPage({ projects, analytics, onRefresh, onOpenStudio }: { projects: Project[]; analytics: AnalyticsResponse | null; onRefresh: () => Promise<void>; onOpenStudio: () => void }) {
  const quickWins = [
    { title: 'One-Click Content', desc: 'فكرة + سكربت + صور + صوت + فيديو + Thumbnail داخل مسار واحد جاهز للتنفيذ.', icon: <Sparkles size={18} /> },
    { title: 'Auto Viral Score', desc: 'تقييم فوري لقوة المحتوى قبل النشر مع مؤشرات تساعدك تحسّن الأداء بسرعة.', icon: <Zap size={18} /> },
    { title: 'Analytics Loop', desc: 'اعرف إيه اللي شغال فعلًا وارجع ابنِ عليه المحتوى القادم بذكاء أكبر.', icon: <Activity size={18} /> },
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي المشاريع" value={analytics?.total_projects ?? 0} icon={<FolderKanban />} hint="كل المشاريع اللي تم إنشاؤها داخل المنصة." />
        <StatCard label="مشاريع منشورة" value={analytics?.published_projects ?? 0} icon={<Rocket />} hint="المشاريع الجاهزة أو المنشورة بالفعل." />
        <StatCard label="متوسط Viral Score" value={analytics?.avg_viral_score ?? 0} icon={<Zap />} hint={averageScoreLabel(Number(analytics?.avg_viral_score ?? 0))} />
        <StatCard label="عدد المنصات النشطة" value={analytics?.top_platforms.length ?? 0} icon={<BarChart3 />} hint="التوزيع الحالي للمحتوى على المنصات المختلفة." />
      </div>

      <SectionCard
        eyebrow="Quick launch"
        title="ابدأ شغل احترافي في دقائق"
        subtitle="كل حاجة في الواجهة متظبطة علشان تقلل الاحتكاك وتوصل للمحتوى النهائي بأقل عدد خطوات ممكنة."
        actions={
          <>
            <Button variant="secondary" onClick={() => void onRefresh()}>تحديث البيانات</Button>
            <Button onClick={onOpenStudio}>افتح الاستوديو <ArrowLeft size={16} /></Button>
          </>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {quickWins.map((item) => (
              <div key={item.title} className="rounded-[26px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-300">{item.icon}</div>
                <p className="mt-4 text-base font-black text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(91,92,240,0.12)_0%,rgba(34,211,238,0.1)_100%)] p-6 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(91,92,240,0.14)_0%,rgba(15,23,42,0.35)_100%)]">
            <Badge tone="purple">Performance snapshot</Badge>
            <h3 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">ركز على أعلى المشاريع تقييمًا وكرّر العناصر اللي شغالة.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">كل ما تقيس، هتعرف أسرع إيه نوع الـ Hook والـ CTA والـ platform اللي بيوصل أحسن. ده معناه إنتاج أسرع ونتائج أوضح.</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs text-slate-400">أعلى منصة</p>
                <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{analytics?.top_platforms?.[0]?.platform || '—'}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs text-slate-400">عدد المشاريع الحديثة</p>
                <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{projects.slice(0, 6).length}</p>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Latest work" title="آخر المشاريع" subtitle="آخر 6 مشاريع محفوظة في النظام مع رؤية سريعة للحالة والوسائط والـ viral score.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.slice(0, 6).map((project) => <ProjectCard key={project.id} project={project} />)}
          {!projects.length ? <EmptyState title="ابدأ أول مشروع" description="افتح الاستوديو وأنشئ أول workflow كامل. بمجرد إنشاء مشروع هتظهر هنا آخر الأعمال مع المخرجات والملفات." icon={<Sparkles size={24} />} /> : null}
        </div>
      </SectionCard>
    </>
  )
}
