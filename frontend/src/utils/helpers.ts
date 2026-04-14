export const cls = (...items: Array<string | false | null | undefined>) => items.filter(Boolean).join(' ')

export const formatDate = (value?: string) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-amber-500'
  return 'text-rose-500'
}

export const shortText = (text?: string | null, size = 140) => {
  if (!text) return '—'
  return text.length > size ? `${text.slice(0, size)}...` : text
}

export const getErrorMessage = (error: any, fallback = 'حدث خطأ غير متوقع، جرّب مرة أخرى') => {
  return error?.response?.data?.detail || error?.message || fallback
}

export const platformLabel = (platform?: string | null) => {
  const map: Record<string, string> = {
    tiktok: 'TikTok',
    youtube: 'YouTube',
    instagram: 'Instagram',
  }
  return platform ? map[platform] || platform : 'غير محدد'
}

export const averageScoreLabel = (score: number) => {
  if (score >= 80) return 'ممتاز جدًا'
  if (score >= 60) return 'جيد'
  return 'يحتاج تحسين'
}
