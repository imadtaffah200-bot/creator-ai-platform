import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Film, ImageIcon, Mic2, MonitorPlay, PanelsTopLeft } from 'lucide-react'
import { EmptyState, Panel } from './ui'

function MediaBlock({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[26px] border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
        <span className="text-indigo-500">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

export function MediaPreview({ imageUrls, audioUrl, videoUrl, avatarUrl, thumbnailUrl }: { imageUrls?: string[] | null; audioUrl?: string | null; videoUrl?: string | null; avatarUrl?: string | null; thumbnailUrl?: string | null }) {
  const hasMedia = Boolean(thumbnailUrl || imageUrls?.length || audioUrl || videoUrl || avatarUrl)

  return (
    <Panel className="h-full">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-indigo-500">Media Output</p>
          <h3 className="mt-2 text-xl font-black text-slate-950 dark:text-white">المعاينة المباشرة</h3>
        </div>
        <div className="rounded-2xl bg-indigo-500/10 px-3 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-300">Live Preview</div>
      </div>
      {!hasMedia ? <EmptyState title="لسه مفيش مخرجات" description="ابدأ بتوليد فكرة أو صورة أو صوت، وهتظهر المعاينة هنا بشكل منظم وواضح." icon={<PanelsTopLeft size={24} />} /> : null}
      <div className="grid gap-4">
        {thumbnailUrl ? <MediaBlock title="Thumbnail" icon={<Film size={18} />}><motion.img initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={thumbnailUrl} alt="thumbnail" className="h-52 w-full rounded-2xl object-cover" /></MediaBlock> : null}
        {imageUrls?.length ? (
          <MediaBlock title="الصور المولدة" icon={<ImageIcon size={18} />}>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {imageUrls.map((url, index) => <motion.img initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={url} src={url} alt="generated" className="h-44 w-full rounded-2xl object-cover" />)}
            </div>
          </MediaBlock>
        ) : null}
        {audioUrl ? <MediaBlock title="التعليق الصوتي" icon={<Mic2 size={18} />}><audio className="w-full" controls src={audioUrl} /></MediaBlock> : null}
        {videoUrl ? <MediaBlock title="الفيديو النهائي" icon={<MonitorPlay size={18} />}><video className="w-full rounded-2xl" controls src={videoUrl} /></MediaBlock> : null}
        {avatarUrl ? <MediaBlock title="AI Avatar" icon={<Film size={18} />}><video className="w-full rounded-2xl" controls src={avatarUrl} /></MediaBlock> : null}
      </div>
    </Panel>
  )
}
