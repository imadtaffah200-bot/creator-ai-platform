import { useState } from 'react'
import toast from 'react-hot-toast'
import { Download, Trash2 } from 'lucide-react'
import { SectionCard } from '@components/SectionCard'
import { ProjectCard } from '@components/ProjectCard'
import { Button, EmptyState } from '@components/ui'
import { api } from '@utils/api'
import type { Project } from '@utils/types'
import { getErrorMessage } from '@utils/helpers'

export function ProjectsPage({ projects, onRefresh }: { projects: Project[]; onRefresh: () => Promise<void> }) {
  const [deleting, setDeleting] = useState<number | null>(null)

  const removeProject = async (id: number) => {
    setDeleting(id)
    try {
      await api.delete(`/api/projects/${id}`)
      await onRefresh()
      toast.success('تم حذف المشروع')
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر حذف المشروع'))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <SectionCard eyebrow="Project library" title="نظام المشاريع" subtitle="إدارة كل الملفات والمخرجات في واجهة مرتبة وسهلة التصفّح.">
      <div className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => (
          <div key={project.id} className="grid gap-3">
            <ProjectCard project={project} />
            <div className="flex flex-wrap gap-2">
              {project.video_url ? <a href={project.video_url} target="_blank" rel="noreferrer"><Button variant="success" size="sm"><Download size={16} />تحميل الفيديو</Button></a> : null}
              {project.audio_url ? <a href={project.audio_url} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm"><Download size={16} />تحميل الصوت</Button></a> : null}
              {project.thumbnail_url ? <a href={project.thumbnail_url} target="_blank" rel="noreferrer"><Button variant="secondary" size="sm"><Download size={16} />تحميل Thumbnail</Button></a> : null}
              <Button onClick={() => void removeProject(project.id)} variant="danger" size="sm"><Trash2 size={16} />{deleting === project.id ? 'جارٍ الحذف...' : 'حذف المشروع'}</Button>
            </div>
          </div>
        ))}
        {!projects.length ? <EmptyState title="مفيش مشاريع محفوظة دلوقتي" description="أول ما تبدأ تولّد محتوى أو تحفظ مشروع جديد، هيظهر هنا مع روابط التنزيل والإدارة." /> : null}
      </div>
    </SectionCard>
  )
}
