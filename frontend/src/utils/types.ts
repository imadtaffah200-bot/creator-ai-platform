export type AppTab = 'dashboard' | 'studio' | 'trends' | 'projects' | 'assistant' | 'analytics'

export interface User {
  id: number
  full_name: string
  email: string
  is_active: boolean
  created_at: string
}

export interface Project {
  id: number
  user_id: number
  title: string
  niche?: string | null
  platform?: string | null
  dialect?: string | null
  status: string
  description?: string | null
  idea_text?: string | null
  script_text?: string | null
  hooks?: string[] | null
  hashtags?: string[] | null
  best_posting_times?: string[] | null
  trend_snapshot?: Record<string, unknown> | null
  recommendations?: string[] | null
  image_urls?: string[] | null
  audio_url?: string | null
  video_url?: string | null
  avatar_url?: string | null
  thumbnail_url?: string | null
  analytics?: Record<string, unknown> | null
  viral_score: number
  created_at: string
  updated_at: string
}

export interface AnalyticsResponse {
  total_projects: number
  published_projects: number
  avg_viral_score: number
  top_platforms: { platform: string; count: number }[]
  latest_projects: Project[]
}
