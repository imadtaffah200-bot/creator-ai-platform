import { useState } from 'react'
import toast from 'react-hot-toast'
import { Clock3, Hash, Lightbulb, TrendingUp } from 'lucide-react'
import { SectionCard } from '@components/SectionCard'
import { TrendCard } from '@components/TrendCard'
import { api } from '@utils/api'
import { Button, EmptyState, Input } from '@components/ui'
import { getErrorMessage } from '@utils/helpers'

export function TrendsPage() {
  const [niche, setNiche] = useState('تعليم')
  const [countryCode, setCountryCode] = useState('EG')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/trends/daily', { params: { niche, country_code: countryCode } })
      setData(res.data)
      toast.success('تم تحميل الترندات')
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر تحليل الترندات'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <SectionCard eyebrow="Trend radar" title="تحليل الترندات" subtitle="يجمع YouTube + Google Trends + TikTok/Instagram عند تفعيل المزودات الاختيارية في واجهة أوضح وأسهل قراءة.">
        <div className="grid gap-3 md:grid-cols-[1fr_180px_160px]">
          <Input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="المجال أو النيتش" />
          <Input value={countryCode} onChange={(e) => setCountryCode(e.target.value)} placeholder="EG / SA / MA" dir="ltr" />
          <Button onClick={load}>{loading ? 'جارٍ التحليل...' : 'حلّل الآن'}</Button>
        </div>
      </SectionCard>

      {data ? (
        <>
          <SectionCard eyebrow="Insights" title="أهم الملاحظات اليومية" subtitle="اقرأ الخلاصة سريعًا ثم انطلق مباشرة للاستوديو أو تنفيذ الفكرة.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data.insights.map((item: string) => (
                <div key={item} className="rounded-[26px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500"><Lightbulb size={18} /></div>
                  <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard eyebrow="Publishing" title="Hashtags + أوقات النشر" subtitle="تنظيم بصري أجمل للهاشتاغات والمواعيد المناسبة للنشر.">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-4 flex items-center gap-2 text-base font-black text-slate-950 dark:text-white"><Hash size={18} className="text-indigo-500" />الهاشتاغات</div>
                <div className="flex flex-wrap gap-2">{data.hashtags.map((tag: string) => <span key={tag} className="rounded-full bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">{tag}</span>)}</div>
              </div>
              <div className="rounded-[28px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mb-4 flex items-center gap-2 text-base font-black text-slate-950 dark:text-white"><Clock3 size={18} className="text-emerald-500" />أفضل الأوقات</div>
                <ul className="grid gap-3 text-sm">
                  {data.best_posting_times.map((time: string) => <li key={time} className="rounded-2xl bg-slate-100/80 px-4 py-3 dark:bg-white/5">{time}</li>)}
                </ul>
              </div>
            </div>
          </SectionCard>
          <SectionCard eyebrow="Sources" title="مصادر الترندات" subtitle="روابط منظمة للمصادر الفعلية القادمة من YouTube و Google Trends.">
            <div className="grid gap-4 lg:grid-cols-2">
              {(data.sources.youtube || []).map((item: any) => <TrendCard key={item.url} title={item.title} meta={`${item.channel || ''} • ${item.views || 0} مشاهدة`} url={item.url} />)}
              {(data.sources.google_trends || []).map((item: any) => <TrendCard key={item.link} title={item.title} meta={item.published} url={item.link} />)}
            </div>
          </SectionCard>
        </>
      ) : (
        <EmptyState title="ابدأ تحليل الترندات" description="اكتب الـ niche وحدد الدولة واضغط تحليل الآن، وهتظهر لك insights وهاشتاغات ومصادر مباشرة بشكل مرتب." icon={<TrendingUp size={24} />} />
      )}
    </div>
  )
}
