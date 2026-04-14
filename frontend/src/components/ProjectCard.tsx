import { CalendarDays, PlayCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from '@utils/types'
import { formatDate, platformLabel, scoreColor, shortText } from '@utils/helpers'
import { Badge } from './ui'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article whileHover={{ y: -4 }} className="rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap gap-2">
            {project.platform ? <Badge>{platformLabel(project.platform)}</Badge> : null}
            {project.dialect ? <Badge tone="emerald">{project.dialect}</Badge> : null}
            <Badge tone="slate">{project.status}</Badge>
          </div>
          <h4 className="truncate text-lg font-black text-slate-950 dark:text-white">{project.title}</h4>
          <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{shortText(project.idea_text || project.description, 150)}</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center dark:bg-white/5">
          <p className="text-xs text-slate-400">Viral</p>
          <span className={`mt-1 block text-2xl font-black ${scoreColor(project.viral_score)}`}>{project.viral_score}</span>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-2 text-sm text-slate-500 dark:text-slate-400 md:grid-cols-3">
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2 dark:bg-white/5"><Sparkles size={16} />{project.image_urls?.length || 0} صور</div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2 dark:bg-white/5"><PlayCircle size={16} />{project.video_url ? 'فيديو جاهز' : 'بدون فيديو'}</div>
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-2 dark:bg-white/5"><CalendarDays size={16} />{formatDate(project.updated_at)}</div>
      </div>
    </motion.article>
  )
}
