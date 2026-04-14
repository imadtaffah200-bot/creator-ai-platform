import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { AudioLines, Clapperboard, ImageIcon, Lightbulb, MonitorPlay, Sparkles, Wand2 } from 'lucide-react'
import { FormField } from '@components/FormField'
import { MediaPreview } from '@components/MediaPreview'
import { SectionCard } from '@components/SectionCard'
import { Badge, Button, InfoNote, Input, Select, Textarea } from '@components/ui'
import { api } from '@utils/api'
import { DIALECTS, NICHES, PLATFORMS, STYLES } from '@utils/constants'
import type { Project } from '@utils/types'
import { getErrorMessage } from '@utils/helpers'

type MediaState = { imageUrls: string[]; audioUrl?: string; videoUrl?: string; avatarUrl?: string; thumbnailUrl?: string }

export function StudioPage({ projects, onRefresh }: { projects: Project[]; onRefresh: () => Promise<void> }) {
  const [projectTitle, setProjectTitle] = useState('مشروع محتوى جديد')
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('')
  const [niche, setNiche] = useState('تعليم')
  const [dialect, setDialect] = useState('العربية المبسطة')
  const [platform, setPlatform] = useState('tiktok')
  const [idea, setIdea] = useState('')
  const [script, setScript] = useState('')
  const [imagePrompt, setImagePrompt] = useState('مشهد عربي سينمائي لصانع محتوى يشرح فكرة بوضوح أمام الكاميرا')
  const [voiceText, setVoiceText] = useState('')
  const [style, setStyle] = useState('سينمائي')
  const [loading, setLoading] = useState<string | null>(null)
  const [ideaPack, setIdeaPack] = useState<any>(null)
  const [scriptPack, setScriptPack] = useState<any>(null)
  const [media, setMedia] = useState<MediaState>({ imageUrls: [] })
  const [hooks, setHooks] = useState<string[]>([])

  const currentProject = useMemo(() => projects.find((item) => item.id === Number(selectedProjectId)) || null, [projects, selectedProjectId])

  const wrapAction = async (key: string, callback: () => Promise<void>, successMessage?: string) => {
    setLoading(key)
    try {
      await callback()
      if (successMessage) toast.success(successMessage)
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر تنفيذ الإجراء الحالي'))
    } finally {
      setLoading(null)
    }
  }

  const createProject = async () => wrapAction('project', async () => {
    const res = await api.post('/api/projects', { title: projectTitle, niche, dialect, platform })
    setSelectedProjectId(res.data.id)
    await onRefresh()
  }, 'تم إنشاء المشروع')

  const generateIdeas = async () => wrapAction('ideas', async () => {
    const res = await api.post('/api/ai/ideas', { niche, audience: 'صناع محتوى عرب', dialect, platforms: [platform], country_code: 'EG', count: 6 })
    setIdeaPack(res.data)
    const firstIdea = res.data?.ideas?.[0]?.title
    if (firstIdea) setIdea(firstIdea)
  }, 'تم توليد أفكار جديدة')

  const generateHooks = async () => wrapAction('hooks', async () => {
    const res = await api.post('/api/ai/hooks', { topic: idea || niche, dialect, count: 8 })
    setHooks(res.data.hooks || [])
  }, 'تم توليد الـ hooks')

  const generateScript = async () => wrapAction('script', async () => {
    const res = await api.post('/api/ai/script', { idea, dialect, tone: 'حماسي', platform, duration_seconds: 45, include_cta: true })
    setScriptPack(res.data)
    setScript(res.data.full_script || '')
    setVoiceText(res.data.full_script || '')
    if (res.data.shot_list?.[0]?.visual) setImagePrompt(res.data.shot_list[0].visual)
  }, 'تم إنشاء السكربت')

  const generateImage = async () => wrapAction('image', async () => {
    const res = await api.post('/api/ai/image', { prompt: imagePrompt || idea || niche, style, project_id: selectedProjectId || null })
    setMedia((prev) => ({ ...prev, imageUrls: [...prev.imageUrls, res.data.image_url] }))
    await onRefresh()
  }, 'تم توليد الصورة')

  const generateAudio = async () => wrapAction('audio', async () => {
    const res = await api.post('/api/ai/tts', { text: voiceText || script || idea, voice: 'alloy', project_id: selectedProjectId || null })
    setMedia((prev) => ({ ...prev, audioUrl: res.data.audio_url }))
    await onRefresh()
  }, 'تم توليد الصوت')

  const generateThumbnail = async () => wrapAction('thumbnail', async () => {
    const res = await api.post('/api/ai/thumbnail', { topic: idea || niche, subtitle: scriptPack?.title || '', style: 'سينمائي عربي', project_id: selectedProjectId || null })
    setMedia((prev) => ({ ...prev, thumbnailUrl: res.data.thumbnail_url }))
    await onRefresh()
  }, 'تم إنشاء الـ Thumbnail')

  const buildVideo = async () => wrapAction('video', async () => {
    const res = await api.post('/api/ai/build-video', {
      script_text: script || voiceText,
      image_urls: media.imageUrls.length ? media.imageUrls : currentProject?.image_urls || [],
      audio_url: media.audioUrl || currentProject?.audio_url,
      project_id: selectedProjectId || null,
    })
    setMedia((prev) => ({ ...prev, videoUrl: res.data.video_url }))
    await onRefresh()
  }, 'تم بناء الفيديو')

  const createAvatar = async () => {
    const avatarImage = media.imageUrls[0] || currentProject?.image_urls?.[0]
    if (!avatarImage) {
      toast.error('ولّد صورة أولًا قبل إنشاء الأفاتار')
      return
    }
    await wrapAction('avatar', async () => {
      const res = await api.post('/api/ai/avatar', { image_url: avatarImage, script_text: script || voiceText, voice: 'Sarah', project_id: selectedProjectId || null })
      setMedia((prev) => ({ ...prev, avatarUrl: res.data.avatar_url }))
      await onRefresh()
    }, 'تم إنشاء الأفاتار')
  }

  const oneClick = async () => wrapAction('full', async () => {
    const res = await api.post('/api/ai/full-content', { niche, audience: 'صناع المحتوى العرب', dialect, platform, visual_style: style, duration_seconds: 45, project_title: projectTitle })
    setIdea(res.data.idea)
    setScript(res.data.script.full_script)
    setVoiceText(res.data.script.full_script)
    setHooks(res.data.hooks || [])
    setMedia({ imageUrls: res.data.image_urls || [], audioUrl: res.data.audio_url, videoUrl: res.data.video_url, thumbnailUrl: res.data.thumbnail_url })
    setSelectedProjectId(res.data.project_id)
    await onRefresh()
  }, 'تم إنشاء المحتوى الكامل')

  const actionCards = [
    { title: 'Ideas', desc: 'ابني فكرة قابلة للانتشار في السوق العربي.', icon: <Lightbulb size={18} /> },
    { title: 'Script', desc: 'حوّل الفكرة إلى Hook + Storytelling + CTA.', icon: <Wand2 size={18} /> },
    { title: 'Media', desc: 'ولّد صورة وصوت وفيديو وأفاتار في نفس المسار.', icon: <Clapperboard size={18} /> },
  ]

  return (
    <div className="grid gap-6">
      <SectionCard eyebrow="Studio setup" title="AI Studio" subtitle="نفس الوظائف الحالية لكن بتجربة أوضح، خطوات مرتبة، وتحكم أسهل في كل مرحلة من الـ workflow.">
        <div className="mb-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {actionCards.map((item) => (
              <div key={item.title} className="rounded-[26px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">{item.icon}</div>
                <p className="mt-4 text-base font-black text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,rgba(91,92,240,0.12)_0%,rgba(34,211,238,0.08)_100%)] p-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(91,92,240,0.12)_0%,rgba(15,23,42,0.35)_100%)]">
            <div className="flex flex-wrap gap-2">
              <Badge>{platform}</Badge>
              <Badge tone="emerald">{dialect}</Badge>
              <Badge tone="purple">{style}</Badge>
            </div>
            <h3 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">مشروعك الحالي: {currentProject?.title || projectTitle}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">ابدأ بإنشاء مشروع أو اختَر مشروعًا محفوظًا، وبعدها امشِ خطوة بخطوة من الفكرة لحد الفيديو النهائي.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs text-slate-400">المشروع المحدد</p>
                <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{selectedProjectId || 'جديد'}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 dark:bg-white/5">
                <p className="text-xs text-slate-400">الخطوة الجارية</p>
                <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{loading || 'جاهز'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <FormField label="اسم المشروع"><Input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} /></FormField>
          <FormField label="المجال"><Select value={niche} onChange={(e) => setNiche(e.target.value)}>{NICHES.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
          <FormField label="اللهجة"><Select value={dialect} onChange={(e) => setDialect(e.target.value)}>{DIALECTS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
          <FormField label="المنصة"><Select value={platform} onChange={(e) => setPlatform(e.target.value)}>{PLATFORMS.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
          <FormField label="ستايل الصور"><Select value={style} onChange={(e) => setStyle(e.target.value)}>{STYLES.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void createProject()}>{loading === 'project' ? 'جارٍ إنشاء المشروع...' : 'إنشاء مشروع'}</Button>
          <Button onClick={() => void oneClick()}>{loading === 'full' ? 'جارٍ إنشاء المحتوى الكامل...' : 'إنشاء محتوى كامل بضغطة واحدة'}</Button>
          <Select value={selectedProjectId} onChange={(e) => setSelectedProjectId(Number(e.target.value) || '')} className="max-w-[280px]">
            <option value="">اختر مشروعًا محفوظًا</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
          </Select>
        </div>
      </SectionCard>

      <SectionCard eyebrow="Step 1" title="مولد الأفكار + Hooks" subtitle="جرّب توليد أفكار متعددة، اختَر الأنسب، وبعدها ولّد hooks جاهزة للالتقاط من أول ثانية.">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto]">
          <Textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={5} className="min-h-[150px]" placeholder="الفكرة النهائية ستظهر هنا" />
          <Button onClick={() => void generateIdeas()} className="lg:self-start">{loading === 'ideas' ? 'جارٍ توليد الأفكار...' : 'توليد أفكار Viral'}</Button>
          <Button variant="secondary" onClick={() => void generateHooks()} className="lg:self-start">{loading === 'hooks' ? 'جارٍ التوليد...' : 'AI Hooks Generator'}</Button>
        </div>
        {ideaPack ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ideaPack.ideas?.map((item: any) => (
              <button key={item.title} onClick={() => setIdea(item.title)} className="rounded-[26px] border border-white/60 bg-white/70 p-5 text-right transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="font-black text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{item.hook}</p>
              </button>
            ))}
          </div>
        ) : null}
        {hooks.length ? <div className="mt-4 flex flex-wrap gap-2">{hooks.map((hook: string) => <span key={hook} className="rounded-full bg-indigo-500/10 px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-300">{hook}</span>)}</div> : null}
      </SectionCard>

      <SectionCard eyebrow="Step 2" title="مولد السكربت باللهجات العربية" subtitle="حوّل الفكرة إلى سكربت متكامل، وعدّل عليه مباشرة قبل الانتقال للإنتاج.">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <Textarea value={script} onChange={(e) => setScript(e.target.value)} rows={12} className="min-h-[280px]" placeholder="سيظهر السكربت هنا: Hook + Storytelling + CTA" />
          <Button onClick={() => void generateScript()} className="lg:self-start">{loading === 'script' ? 'جارٍ كتابة السكربت...' : 'تحويل الفكرة إلى سكربت'}</Button>
        </div>
        {scriptPack ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[26px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"><p className="font-black text-slate-950 dark:text-white">Hook</p><p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{scriptPack.hook}</p></div>
            <div className="rounded-[26px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"><p className="font-black text-slate-950 dark:text-white">CTA</p><p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{scriptPack.cta}</p></div>
            <div className="rounded-[26px] border border-white/60 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.03]"><p className="font-black text-slate-950 dark:text-white">Viral Score</p><p className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">{scriptPack.viral_score}</p></div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard eyebrow="Step 3" title="الصور + الصوت + الفيديو + الأفاتار + Thumbnail" subtitle="منطقة الإنتاج المرئي بالكامل: كل الأدوات الحالية موجودة لكن الواجهة بقت أبسط وأوضح في الترتيب.">
        <InfoNote>أفضل نتيجة هتظهر لما يكون عندك: فكرة واضحة + سكربت جاهز + Prompt بصري مناسب. كده كل المخرجات هتكون متناسقة أسرع.</InfoNote>
        <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <div className="grid gap-4">
            <FormField label="Prompt الصورة" icon={<ImageIcon size={16} />}><Textarea value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)} rows={5} className="min-h-[160px]" /></FormField>
            <div className="grid gap-3 md:grid-cols-2">
              <Button variant="success" onClick={() => void generateImage()}>{loading === 'image' ? 'جارٍ توليد الصورة...' : 'إنشاء صورة AI'}</Button>
              <Button variant="secondary" onClick={() => void generateThumbnail()}>{loading === 'thumbnail' ? 'جارٍ الإنشاء...' : 'توليد Thumbnail'}</Button>
            </div>
            <FormField label="النص الصوتي" icon={<AudioLines size={16} />}><Textarea value={voiceText} onChange={(e) => setVoiceText(e.target.value)} rows={6} className="min-h-[180px]" /></FormField>
            <div className="grid gap-3 md:grid-cols-3">
              <Button onClick={() => void generateAudio()}>{loading === 'audio' ? 'جارٍ توليد الصوت...' : 'توليد صوت'}</Button>
              <Button variant="secondary" onClick={() => void buildVideo()}>{loading === 'video' ? 'جارٍ بناء الفيديو...' : 'إنشاء فيديو'}</Button>
              <Button variant="secondary" onClick={() => void createAvatar()}>{loading === 'avatar' ? 'جارٍ إنشاء الأفاتار...' : 'AI Avatar'}</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[26px] border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="inline-flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white"><Sparkles size={16} className="text-indigo-500" />عدد الصور الحالية</div>
                <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{media.imageUrls.length || currentProject?.image_urls?.length || 0}</p>
              </div>
              <div className="rounded-[26px] border border-white/60 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="inline-flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white"><MonitorPlay size={16} className="text-emerald-500" />حالة الفيديو</div>
                <p className="mt-3 text-lg font-black text-slate-950 dark:text-white">{media.videoUrl || currentProject?.video_url ? 'جاهز للمعاينة' : 'لم يتم إنشاؤه بعد'}</p>
              </div>
            </div>
          </div>

          <MediaPreview
            imageUrls={media.imageUrls.length ? media.imageUrls : currentProject?.image_urls}
            audioUrl={media.audioUrl || currentProject?.audio_url}
            videoUrl={media.videoUrl || currentProject?.video_url}
            avatarUrl={media.avatarUrl || currentProject?.avatar_url}
            thumbnailUrl={media.thumbnailUrl || currentProject?.thumbnail_url}
          />
        </div>
      </SectionCard>
    </div>
  )
}
