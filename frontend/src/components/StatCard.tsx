import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Badge } from './ui'

export function StatCard({ label, value, icon, hint }: { label: string; value: ReactNode; icon: ReactNode; hint?: string }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="relative overflow-hidden rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#5b5cf0_0%,#22d3ee_100%)]" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone="slate">Metric</Badge>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <div className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</div>
          {hint ? <p className="mt-3 text-xs leading-6 text-slate-400">{hint}</p> : null}
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300">{icon}</div>
      </div>
    </motion.div>
  )
}
