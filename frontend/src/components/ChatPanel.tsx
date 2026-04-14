import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, SendHorizonal, Sparkles, UserCircle2 } from 'lucide-react'
import { api } from '@utils/api'
import { getErrorMessage } from '@utils/helpers'
import { SectionCard } from './SectionCard'
import { Button, Input, Textarea } from './ui'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'حسّن الـ Hook وخليه أقوى باللهجة المصرية',
  'اختصر السكربت لـ 30 ثانية مع CTA واضح',
  'حوّل النص لنبرة براند فخمة واحترافية',
]

export function ChatPanel() {
  const [message, setMessage] = useState('')
  const [context, setContext] = useState('')
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const lastReply = useMemo(() => [...history].reverse().find((item) => item.role === 'assistant')?.content, [history])

  const ask = async () => {
    if (!message.trim()) return
    const userMessage = message.trim()
    setHistory((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    setMessage('')
    try {
      const res = await api.post('/api/ai/chat', { message: userMessage, context, dialect: 'العربية المبسطة' })
      setHistory((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
      toast.success('تم الرد من المساعد')
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر إرسال الرسالة'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard eyebrow="Creative copilot" title="المساعد الذكي" subtitle="حسّن السكربت، اطلب Hooks جديدة، أو أعد الصياغة باللهجة التي تريدها.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="grid gap-4">
          <Textarea value={context} onChange={(e) => setContext(e.target.value)} rows={8} className="min-h-[220px]" placeholder="ضع هنا السكربت أو الفكرة الحالية عشان المساعد يبني عليها ردود أفضل." />
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button key={prompt} onClick={() => setMessage(prompt)} className="rounded-full bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-500/15 dark:text-indigo-300">
                <Sparkles size={14} className="ml-1 inline-flex" />
                {prompt}
              </button>
            ))}
          </div>
          <div className="rounded-[26px] border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-sm font-black text-slate-950 dark:text-white">آخر رد ذكي</p>
            <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{lastReply || 'أرسل أول رسالة وهنا هيظهر آخر رد من المساعد بشكل سريع.'}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-slate-950 dark:text-white">واجهة المحادثة</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">محادثة نظيفة وسلسة مع micro-interactions وتحريك ناعم.</p>
            </div>
            <div className="rounded-2xl bg-indigo-500/10 px-3 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-300">AI Ready</div>
          </div>

          <div className="custom-scrollbar grid max-h-[420px] gap-3 overflow-y-auto rounded-[24px] bg-slate-50/90 p-3 dark:bg-slate-950/70">
            {!history.length ? <div className="rounded-2xl border border-dashed border-slate-300/80 p-6 text-sm leading-7 text-slate-500 dark:border-white/10 dark:text-slate-400">ابدأ بسؤال واضح زي: «حسّن الـ hook»، «اختصر السكربت»، أو «عدّل النبرة». هتاخد تجربة دردشة مرتبة وسريعة.</div> : null}
            <AnimatePresence>
              {history.map((item, index) => (
                <motion.div key={`${item.role}-${index}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`flex ${item.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[90%] rounded-[24px] px-4 py-3 text-sm leading-7 shadow-sm ${item.role === 'user' ? 'bg-white text-slate-800 dark:bg-white/10 dark:text-slate-100' : 'bg-[linear-gradient(135deg,#5b5cf0_0%,#7c3aed_100%)] text-white'}`}>
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold opacity-90">{item.role === 'user' ? <UserCircle2 size={14} /> : <Bot size={14} />}{item.role === 'user' ? 'أنت' : 'المساعد'}</div>
                    {item.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex gap-3">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="مثال: حسّن الـ Hook وخليه أقوى باللهجة المصرية" className="flex-1" />
            <Button onClick={ask} disabled={loading}>{loading ? 'جارٍ الإرسال...' : 'إرسال'}<SendHorizonal size={16} /></Button>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
