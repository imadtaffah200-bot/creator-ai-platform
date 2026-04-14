import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, LoaderCircle, Sparkles } from 'lucide-react'
import { cls } from '@utils/helpers'

export function Panel({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className={cls(
        'rounded-[28px] border border-white/60 bg-white/80 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]',
        className,
      )}
    >
      {children}
    </motion.section>
  )
}

export function Button({ className, variant = 'primary', size = 'md', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'; size?: 'sm' | 'md' | 'lg' }) {
  const variants = {
    primary: 'bg-[linear-gradient(135deg,#5b5cf0_0%,#8b5cf6_100%)] text-white shadow-[0_10px_30px_rgba(91,92,240,0.35)] hover:brightness-110',
    secondary: 'border border-slate-200/80 bg-white/80 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/10',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
    danger: 'bg-[linear-gradient(135deg,#ef4444_0%,#f97316_100%)] text-white shadow-[0_10px_30px_rgba(239,68,68,0.28)] hover:brightness-110',
    success: 'bg-[linear-gradient(135deg,#10b981_0%,#14b8a6_100%)] text-white shadow-[0_10px_30px_rgba(16,185,129,0.28)] hover:brightness-110',
  }
  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-base',
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }} className="inline-flex">
      <button
        className={cls(
          'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </motion.div>
  )
}

const fieldBase = 'w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 dark:border-white/10 dark:bg-slate-950/65 dark:text-white dark:hover:border-white/15'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cls(fieldBase, props.className)} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cls(fieldBase, 'min-h-[120px] resize-y leading-7', props.className)} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cls(fieldBase, 'cursor-pointer appearance-none', props.className)} />
}

export function Badge({ className, tone = 'default', children }: PropsWithChildren<{ className?: string; tone?: 'default' | 'purple' | 'emerald' | 'amber' | 'rose' | 'slate' }>) {
  const tones = {
    default: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
    purple: 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
  }
  return <span className={cls('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', tones[tone], className)}>{children}</span>
}

export function SectionHeading({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">{eyebrow}</p> : null}
        <h2 className="text-xl font-black tracking-tight text-slate-950 dark:text-white md:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  )
}

export function Spinner({ label = 'جارٍ التحميل...' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoaderCircle size={16} className="animate-spin" />
      <span>{label}</span>
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cls('animate-pulse rounded-2xl bg-slate-200/80 dark:bg-white/10', className)} />
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300/80 bg-white/40 p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
        {icon || <Sparkles size={24} />}
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  )
}

export function InfoNote({ children }: PropsWithChildren) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
