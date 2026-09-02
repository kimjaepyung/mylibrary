import React, { useState, useMemo } from 'react'
import {
  Library,
  Grid,
  Calendar,
  Sparkles,
  Heart,
  Star,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  ArrowUpDown,
  Filter,
  Layers,
  MessageSquareQuote
} from 'lucide-react'
import { Book, ReadingStatus } from '../../types/book'
import { LatexRenderer } from '../common/LatexRenderer'

interface BookshelfViewProps {
  books: Book[]
  searchQuery: string
  selectedCategory: string
  onSelectBook: (book: Book) => void
  onOpenAiDiscussion: (book: Book) => void
}

export const BookshelfView: React.FC<BookshelfViewProps> = ({
  books,
  searchQuery,
  selectedCategory,
  onSelectBook,
  onOpenAiDiscussion
}) => {
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'timeline'>('shelf')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [sortBy, setSortBy] = useState<'completedDate' | 'rating' | 'title' | 'pages'>('completedDate')
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  // Filtered and Sorted Books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = book.title.toLowerCase().includes(q)
          const matchAuthor = book.author.toLowerCase().includes(q)
          const matchTags = book.tags?.some((t) => t.toLowerCase().includes(q))
          const matchQuotes = book.quotes?.some((quo) => quo.content.toLowerCase().includes(q))
          const matchReview =
            book.review.oneLiner?.toLowerCase().includes(q) ||
            book.review.summary?.toLowerCase().includes(q)
          if (!matchTitle && !matchAuthor && !matchTags && !matchQuotes && !matchReview) {
            return false
          }
        }

        // Category filter
        if (selectedCategory !== 'ALL' && book.category !== selectedCategory) {
          return false
        }

        // Status filter
        if (statusFilter === 'reading' && book.status !== 'reading') return false
        if (statusFilter === 'completed' && book.status !== 'completed') return false
        if (statusFilter === 'wishlist' && book.status !== 'wishlist') return false

        // Favorites only
        if (onlyFavorites && !book.isFavorite) return false

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'completedDate') {
          return (b.completedDate || b.startDate || '').localeCompare(a.completedDate || a.startDate || '')
        }
        if (sortBy === 'rating') {
          return (b.review.rating || 0) - (a.review.rating || 0)
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title)
        }
        if (sortBy === 'pages') {
          return (b.totalPages || 0) - (a.totalPages || 0)
        }
        return 0
      })
  }, [books, searchQuery, selectedCategory, statusFilter, sortBy, onlyFavorites])

  // Partition books into shelf tiers (6 books per shelf tier)
  const shelfTiers = useMemo(() => {
    const tiers: Book[][] = []
    const tierSize = 7
    for (let i = 0; i < filteredBooks.length; i += tierSize) {
      tiers.push(filteredBooks.slice(i, i + tierSize))
    }
    return tiers.length > 0 ? tiers : [[]]
  }, [filteredBooks])

  return (
    <div className="space-y-6">
      
      {/* View Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
        
        {/* Left: Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => {
              setStatusFilter('ALL')
              setOnlyFavorites(false)
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              statusFilter === 'ALL' && !onlyFavorites
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:bg-amber-500/10'
            }`}
          >
            전체 ({books.length})
          </button>

          <button
            onClick={() => {
              setStatusFilter('completed')
              setOnlyFavorites(false)
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              statusFilter === 'completed' && !onlyFavorites
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:bg-emerald-500/10'
            }`}
          >
            ✅ 완독 ({books.filter((b) => b.status === 'completed').length})
          </button>

          <button
            onClick={() => {
              setStatusFilter('reading')
              setOnlyFavorites(false)
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              statusFilter === 'reading' && !onlyFavorites
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:bg-blue-500/10'
            }`}
          >
            📖 읽는 중 ({books.filter((b) => b.status === 'reading').length})
          </button>

          <button
            onClick={() => {
              setStatusFilter('wishlist')
              setOnlyFavorites(false)
            }}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              statusFilter === 'wishlist' && !onlyFavorites
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:bg-amber-500/10'
            }`}
          >
            🔖 위시리스트 ({books.filter((b) => b.status === 'wishlist').length})
          </button>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all flex items-center gap-1 ${
              onlyFavorites
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] hover:bg-rose-500/10'
            }`}
          >
            <span>❤️ 인생책</span>
            <span>({books.filter((b) => b.isFavorite).length})</span>
          </button>
        </div>

        {/* Right: Sort & View Mode Switches */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] text-xs focus:outline-none"
            >
              <option value="completedDate">최근 완독순</option>
              <option value="rating">별점 높은순</option>
              <option value="title">제목순</option>
              <option value="pages">페이지 많은순</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--bg-surface-secondary)]">
            <button
              onClick={() => setViewMode('shelf')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'shelf'
                  ? 'bg-[var(--bg-surface)] text-amber-600 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="3D 책장 책등 뷰"
            >
              <Library className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--bg-surface)] text-amber-600 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="표지 카드 갤러리 뷰"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[var(--bg-surface)] text-amber-600 shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
              title="독서 일지 타임라인 뷰"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* =========================================================================
          VIEW MODE 1: 3D 책등 책장 뷰 (Spine Bookshelf View)
          ========================================================================= */}
      {viewMode === 'shelf' && (
        <div className="bookshelf-container">
          {filteredBooks.length > 0 ? (
            shelfTiers.map((tier, tierIdx) => (
              <div key={tierIdx} className="bookshelf-row">
                {/* Books Row */}
                <div className="bookshelf-books">
                  {tier.map((book) => {
                    // Calculate spine width based on totalPages (e.g. 200p -> 40px, 700p -> 64px)
                    const spineWidth = Math.min(72, Math.max(38, Math.round((book.totalPages || 300) / 12)))
                    // Calculate spine height (210px to 250px)
                    const spineHeight = Math.min(250, Math.max(210, 210 + ((book.totalPages || 300) % 35)))

                    return (
                      <div
                        key={book.id}
                        onClick={() => onSelectBook(book)}
                        style={{
                          width: `${spineWidth}px`,
                          height: `${spineHeight}px`,
                          backgroundColor: book.spineColor || '#1e3a8a',
                          color: book.spineTextColor || '#fef3c7'
                        }}
                        className="book-spine group"
                      >
                        {/* Top: Category Tag or Favorite */}
                        <div className="text-[10px] font-bold tracking-wider opacity-90">
                          {book.isFavorite ? '❤️' : book.category.slice(0, 2)}
                        </div>

                        {/* Center: Vertical Title */}
                        <div className="book-spine-title font-serif">
                          {book.title}
                        </div>

                        {/* Bottom: Author & Stars */}
                        <div className="flex flex-col items-center gap-1">
                          <div className="book-spine-author font-sans">
                            {book.author}
                          </div>
                          {book.review.rating > 0 && (
                            <div className="text-[9px] font-bold text-amber-300">
                              ★{book.review.rating}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Wooden Plank */}
                <div className="bookshelf-plank" />
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-color)]">
              <Library className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[var(--text-secondary)]">
                조건에 맞는 도서가 없습니다.
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                상단의 검색어나 필터를 변경하시거나 새 책을 등록해보세요.
              </p>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: 표지 카드 갤러리 뷰 (Grid Card View)
          ========================================================================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredBooks.map((book) => {
            const progressPercent = Math.min(100, Math.round((book.currentPage / (book.totalPages || 1)) * 100))

            return (
              <div
                key={book.id}
                onClick={() => onSelectBook(book)}
                className="book-card group"
              >
                {/* Cover Image */}
                <div className="book-card-cover-wrapper">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="book-card-cover-img"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'
                    }}
                  />
                  {/* Favorite Heart Badge */}
                  {book.isFavorite && (
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-rose-500 text-xs shadow-md">
                      ❤️
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md backdrop-blur-md ${
                        book.status === 'completed'
                          ? 'bg-emerald-600/90 text-white'
                          : book.status === 'reading'
                          ? 'bg-blue-600/90 text-white'
                          : 'bg-amber-600/90 text-white'
                      }`}
                    >
                      {book.status === 'completed' ? '완독' : book.status === 'reading' ? `${progressPercent}%` : '위시'}
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-3.5 flex flex-col flex-1 justify-between bg-[var(--bg-card)]">
                  <div>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[var(--text-primary)] line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {book.author}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{book.review.rating.toFixed(1)}</span>
                    </div>

                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {book.totalPages}p
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: 독서 일지 타임라인 피드 (Timeline View)
          ========================================================================= */}
      {viewMode === 'timeline' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3.5 items-center">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg shadow border border-[var(--border-color)] flex-shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        {book.category}
                      </span>
                      {book.completedDate && (
                        <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          완독: {book.completedDate}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {book.author} · {book.publisher}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span>{book.review.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* One-Liner Review */}
              {book.review.oneLiner && (
                <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border-l-4 border-amber-500 font-serif italic text-xs sm:text-sm text-[var(--text-primary)]">
                  "{book.review.oneLiner}"
                </div>
              )}

              {/* Key Highlights / LaTeX Preview */}
              {book.quotes.length > 0 && (
                <div className="text-xs text-[var(--text-secondary)] space-y-1">
                  <span className="font-bold text-amber-600 dark:text-amber-400 block">
                    💬 대표 밑줄 문장:
                  </span>
                  <LatexRenderer content={`"${book.quotes[0].content}" (p.${book.quotes[0].page || '?'})`} />
                </div>
              )}

              {/* AI Insight Badge if exists */}
              {book.aiInsights && book.aiInsights.length > 0 && (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>💡 AI 심층 토론 통찰 {book.aiInsights.length}개 보관됨 (상세 화면 하단에서 열람)</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
