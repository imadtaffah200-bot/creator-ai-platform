import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@utils/api'
import type { User } from '@utils/types'
import { getErrorMessage } from '@utils/helpers'
import { Button, Input } from '@components/ui'

export function AuthPage({ onAuthenticated }: { onAuthenticated: (token: string, user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload = mode === 'login' ? { email, password } : { full_name: fullName, email, password }
      const res = await api.post(endpoint, payload)
      if (!res.data?.access_token) throw new Error('No token returned from backend')
      onAuthenticated(res.data.access_token, res.data.user)
      toast.success(mode === 'login' ? 'تم تسجيل الدخول' : 'تم إنشاء الحساب بنجاح')
    } catch (err: any) {
      const message = getErrorMessage(err, 'حدث خطأ أثناء المصادقة')
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app px-4 py-6 text-slate-900 dark:text-slate-100 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1320px] items-center gap-6 lg:grid-cols-[1.15fr_0.92fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[36px] border border-white/60 bg-[linear-gradient(135deg,rgba(91,92,240,0.13)_0%,rgba(34,211,238,0.12)_100%)] p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(91,92,240,0.15)_0%,rgba(15,23,42,0.5)_100%)] dark:shadow-[0_30px_90px_rgba(2,6,23,0.45)] md:p-10">
          <div className="absolute left-0 top-0 h-44 w-44 rounded-full bg-white/30 blur-3xl dark:bg-indigo-500/15" />
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-indigo-600 dark:bg-white/10 dark:text-indigo-300">
              <Sparkles size={16} />
              SaaS Premium Experience
            </div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.2] text-slate-950 dark:text-white md:text-5xl">منصة Creator AI بشكل احترافي يناسب صُنّاع المحتوى العرب.</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">أنشئ أفكار، سكربت، صور، صوت، فيديو، وراجع الأداء من Dashboard حديثة، سريعة، ومرتبطة بواجهة عربية كاملة RTL.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                'واجهة حديثة جاهزة للإنتاج',
                'Dark / Light mode سلس',
                'AI Studio مرتب وسريع',
                'Analytics أوضح بصريًا',
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <div className="flex items-center gap-3 text-slate-950 dark:text-white"><CheckCircle2 size={18} className="text-emerald-500" /> <span className="font-bold">{item}</span></div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[36px] border border-white/60 bg-white/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/78 dark:shadow-[0_30px_90px_rgba(2,6,23,0.5)] md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-indigo-500">Welcome back</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">واجهة login / register محسّنة مع micro-interactions ورسائل أوضح.</p>
            </div>
            <div className="rounded-2xl bg-slate-100 p-3 dark:bg-white/5"><LockKeyhole size={20} /></div>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
            <button onClick={() => setMode('register')} className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === 'register' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>إنشاء حساب</button>
            <button onClick={() => setMode('login')} className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${mode === 'login' ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>تسجيل الدخول</button>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="wait">
              {mode === 'register' ? (
                <motion.div key="fullName" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <label className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><UserRound size={16} className="text-indigo-500" />الاسم الكامل</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="اسمك الكامل" />
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div>
              <label className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><Mail size={16} className="text-indigo-500" />البريد الإلكتروني</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" />
            </div>

            <div>
              <label className="mb-2 inline-flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200"><LockKeyhole size={16} className="text-indigo-500" />كلمة المرور</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" />
            </div>

            {error ? <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">{error}</div> : null}

            <Button onClick={submit} disabled={loading} className="w-full">{loading ? 'جارٍ التنفيذ...' : mode === 'login' ? 'دخول للمنصة' : 'إنشاء الحساب'}<ArrowLeft size={16} /></Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
