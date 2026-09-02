import React, { useMemo } from 'react'
import {
  BarChart3,
  Flame,
  BookOpen,
  CheckCircle2,
  FileText,
  Sparkles,
  Quote as QuoteIcon,
  Award,
  Calendar,
  Layers,
  Heart
} from 'lucide-react'
import { Book, AppSettings } from '../../types/book'

interface ReadingStatsViewProps {
  books: Book[]
  settings: AppSettings
  onSelectBook: (book: Book) => void
}

export const ReadingStatsView: React.FC<ReadingStatsViewProps> = ({
  books,
  settings,
  onSelectBook
}) => {
  const completedBooks = useMemo(() => books.filter((b) => b.status === 'completed'), [books])
  const readingBooks = useMemo(() => books.filter((b) => b.status === 'reading'), [books])
  const favoriteBooks = useMemo(() => books.filter((b) => b.isFavorite), [books])

  const totalPagesRead = useMemo(() => {
    return books.reduce((acc, b) => acc + (b.currentPage || (b.status === 'completed' ? b.totalPages : 0)), 0)
  }, [books])

  const totalQuotesCount = useMemo(() => {
    return books.reduce((acc, b) => acc + (b.quotes ? b.quotes.length : 0), 0)
  }, [books])

  const totalAiInsightsCount = useMemo(() => {
    return books.reduce((acc, b) => acc + (b.aiInsights ? b.aiInsights.length : 0), 0)
  }, [books])

  // Category Distribution
  const categoryStats = useMemo(() => {
    const counts: { [key: string]: number } = {}
    books.forEach((b) => {
      counts[b.category] = (counts[b.category] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [books])

  // Monthly breakdown for 2026
  const monthlyStats = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: `${i + 1}월`,
      count: 0
    }))

    completedBooks.forEach((b) => {
      if (b.completedDate) {
        const date = new Date(b.completedDate)
        const m = date.getMonth()
        if (m >= 0 && m < 12) {
          months[m].count += 1
        }
      }
    })
    return months
  }, [completedBooks])

  const goalPercent = Math.min(100, Math.round((completedBooks.length / (settings.annualGoal || 1)) * 100))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner: Annual Goal Progress */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-600/15 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-amber-500/30 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                2026 Annual Reading Challenge
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {settings.userNickname}님의 독서 목표: {completedBooks.length} / {settings.annualGoal}권 완독
              </h2>
            </div>
          </div>

          <div className="text-right self-end sm:self-auto">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {goalPercent}%
            </span>
            <span className="text-xs text-[var(--text-muted)] block">달성률</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[var(--border-color)] overflow-hidden mt-4">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 transition-all duration-700"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-xs font-semibold">총 완독 권수</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {completedBooks.length}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">권</span>
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">현재 {readingBooks.length}권 읽는 중</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-xs font-semibold">총 읽은 페이지</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {totalPagesRead.toLocaleString()}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">p</span>
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">지적 누적 분량</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-xs font-semibold">수집된 명문장</span>
            <QuoteIcon className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {totalQuotesCount}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">개</span>
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">밑줄 & 감상 노트</span>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-1">
            <span className="text-xs font-semibold">AI 심층 통찰</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-[var(--text-primary)]">
            {totalAiInsightsCount}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">건</span>
          </p>
          <span className="text-[10px] text-[var(--text-muted)]">도서 하단 영구 보관</span>
        </div>
      </div>

      {/* Monthly Reading Chart & Category Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Bar Chart */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-600" />
              <span>2026 월별 완독 추이</span>
            </h3>
            <span className="text-xs text-[var(--text-muted)]">단위: 권</span>
          </div>

          <div className="flex items-end justify-between gap-1.5 h-44 pt-6 pb-2 border-b border-[var(--border-color)]">
            {monthlyStats.map((item, idx) => {
              const maxCount = Math.max(1, ...monthlyStats.map((m) => m.count))
              const barHeight = item.count > 0 ? Math.max(15, Math.round((item.count / maxCount) * 100)) : 4

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count > 0 ? `${item.count}` : ''}
                  </span>
                  <div
                    style={{ height: `${barHeight}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      item.count > 0
                        ? 'bg-amber-600 hover:bg-amber-500'
                        : 'bg-[var(--border-color)] opacity-40'
                    }`}
                  />
                  <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                    {item.month}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category & Genre Balance */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>도서 분야 & 카테고리 분포</span>
          </h3>

          <div className="space-y-3 pt-2">
            {categoryStats.map(([catName, count], i) => {
              const pct = Math.round((count / (books.length || 1)) * 100)
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">{catName}</span>
                    <span className="text-[var(--text-muted)] font-mono">
                      {count}권 ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-amber-600 rounded-full"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Favorite Books Shelf */}
      {favoriteBooks.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm space-y-4">
          <h3 className="font-serif font-bold text-base text-[var(--text-primary)] flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>인생책 컬렉션 (My Favorites)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {favoriteBooks.map((b) => (
              <div
                key={b.id}
                onClick={() => onSelectBook(b)}
                className="cursor-pointer group text-center space-y-1.5"
              >
                <div className="aspect-[1/1.42] rounded-lg overflow-hidden border border-[var(--border-color)] shadow-sm group-hover:scale-105 transition-transform bg-zinc-800">
                  <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                </div>
                <h5 className="font-serif font-bold text-xs text-[var(--text-primary)] line-clamp-1 group-hover:text-amber-600">
                  {b.title}
                </h5>
                <span className="text-[10px] text-amber-500 font-bold block">★{b.review.rating}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
