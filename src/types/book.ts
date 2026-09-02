export type ReadingStatus = 'reading' | 'completed' | 'wishlist' | 'paused'

export interface Quote {
  id: string
  page?: number | string
  content: string
  note?: string
  date: string
  tags?: string[]
}

export interface ActionItem {
  id: string
  text: string
  completed: boolean
  targetDate?: string
  completedAt?: string
}

export interface ReadingSession {
  id: string
  round: number // 1회독, 2회독, ...
  startDate: string
  completedDate?: string
  notes?: string
}

export interface AiMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface AiDiscussionInsight {
  id: string
  title: string
  summary: string
  keyPoints: string[]
  mathematicalFormulas?: string[]
  actionIdeas?: string[]
  createdAt: string
}

export interface BookReview {
  rating: number // 0 to 5, 0.5 increments
  oneLiner: string // 한 줄 총평
  motivation: string // [읽게 된 계기]
  summary: string // [핵심 요약]
  impression: string // [나의 감상 / 느낀 점]
  recommendation: string // [추천 대상]
  rawMarkdown?: string // 자유 서식 독서록
}

export interface Book {
  id: string
  title: string
  author: string
  translator?: string
  publisher: string
  publishDate?: string
  isbn?: string
  yes24Url?: string
  coverUrl: string
  totalPages: number
  currentPage: number
  category: string
  tags: string[]
  status: ReadingStatus
  isFavorite: boolean
  startDate?: string
  completedDate?: string
  sessions: ReadingSession[]
  review: BookReview
  quotes: Quote[]
  actionItems: ActionItem[]
  aiInsights: AiDiscussionInsight[] // Requirement 5: AI 토론 핵심 통찰 정리
  aiChatHistory: AiMessage[] // 대화 내역
  toc?: string // 목차
  description?: string // 책 소개
  spineColor?: string // 책등 배경색
  spineTextColor?: string // 책등 텍스트 색상
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  geminiApiKey: string
  openaiApiKey: string
  selectedAiProvider: 'gemini' | 'openai'
  geminiModel: string
  theme: 'wood' | 'midnight' | 'paper'
  annualGoal: number
  userNickname: string
  defaultViewMode: 'shelf' | 'grid' | 'timeline' | 'stats'
}

export interface Yes24SearchResult {
  title: string
  author: string
  publisher: string
  publishDate: string
  isbn: string
  coverUrl: string
  totalPages?: number
  category?: string
  description?: string
  toc?: string
  yes24Url?: string
}
