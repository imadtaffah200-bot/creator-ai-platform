import { motion } from 'framer-motion'
import { ArrowUpLeft } from 'lucide-react'

export function TrendCard({ title, meta, url }: { title: string; meta?: string; url?: string }) {
  return (
    <motion.a whileHover={{ y: -4 }} href={url || '#'} target="_blank" rel="noreferrer" className="group block rounded-[26px] border border-white/60 bg-white/80 p-5 transition dark:border-white/10 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-base font-black text-slate-950 dark:text-white">{title}</h4>
        <span className="rounded-xl bg-slate-100 p-2 text-slate-500 transition group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:bg-white/5 dark:text-slate-400 dark:group-hover:text-indigo-300"><ArrowUpLeft size={16} /></span>
      </div>
      {meta ? <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{meta}</p> : null}
    </motion.a>
  )
}
