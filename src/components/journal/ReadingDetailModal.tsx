import React, { useState } from 'react'
import {
  X,
  Star,
  BookOpen,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Quote as QuoteIcon,
  MessageSquare,
  ListTodo,
  Edit3,
  Bookmark,
  Share2,
  Layers
} from 'lucide-react'
import { Book, Quote, ActionItem, ReadingStatus } from '../../types/book'
import { LatexRenderer } from '../common/LatexRenderer'

interface ReadingDetailModalProps {
  book: Book
  onClose: () => void
  onUpdateBook: (updatedBook: Book) => void
  onDeleteBook: (bookId: string) => void
  onOpenAiDiscussion: (book: Book) => void
  onOpenQuoteCard: (quote: Quote, book: Book) => void
}

export const ReadingDetailModal: React.FC<ReadingDetailModalProps> = ({
  book,
  onClose,
  onUpdateBook,
  onDeleteBook,
  onOpenAiDiscussion,
  onOpenQuoteCard
}) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'quotes' | 'actions' | 'info'>('journal')
  const [isEditingReview, setIsEditingReview] = useState(false)
  const [editedReview, setEditedReview] = useState(book.review)
  const [newQuoteText, setNewQuoteText] = useState('')
  const [newQuotePage, setNewQuotePage] = useState('')
  const [newQuoteNote, setNewQuoteNote] = useState('')
  const [newActionText, setNewActionText] = useState('')
  const [newActionDate, setNewActionDate] = useState('')

  // Handle Review Save
  const handleSaveReview = () => {
    onUpdateBook({
      ...book,
      review: editedReview,
      updatedAt: new Date().toISOString()
    })
    setIsEditingReview(false)
  }

  // Handle Status Change
  const handleStatusChange = (newStatus: ReadingStatus) => {
    const isNowCompleted = newStatus === 'completed' && book.status !== 'completed'
    onUpdateBook({
      ...book,
      status: newStatus,
      completedDate: isNowCompleted ? new Date().toISOString().slice(0, 10) : book.completedDate,
      currentPage: newStatus === 'completed' ? book.totalPages : book.currentPage,
      updatedAt: new Date().toISOString()
    })
  }

  // Handle Page Progress Update
  const handleProgressChange = (page: number) => {
    const validPage = Math.max(0, Math.min(book.totalPages, page))
    const isCompleted = validPage >= book.totalPages
    onUpdateBook({
      ...book,
      currentPage: validPage,
      status: isCompleted ? 'completed' : book.status,
      completedDate: isCompleted && !book.completedDate ? new Date().toISOString().slice(0, 10) : book.completedDate,
      updatedAt: new Date().toISOString()
    })
  }

  // Add Quote
  const handleAddQuote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuoteText.trim()) return

    const newQuote: Quote = {
      id: 'q-' + Date.now(),
      page: newQuotePage ? parseInt(newQuotePage) || newQuotePage : undefined,
      content: newQuoteText.trim(),
      note: newQuoteNote.trim(),
      date: new Date().toISOString().slice(0, 10)
    }

    onUpdateBook({
      ...book,
      quotes: [newQuote, ...book.quotes],
      updatedAt: new Date().toISOString()
    })

    setNewQuoteText('')
    setNewQuotePage('')
    setNewQuoteNote('')
  }

  // Delete Quote
  const handleDeleteQuote = (quoteId: string) => {
    onUpdateBook({
      ...book,
      quotes: book.quotes.filter((q) => q.id !== quoteId),
      updatedAt: new Date().toISOString()
    })
  }

  // Add Action Item
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newActionText.trim()) return

    const newAction: ActionItem = {
      id: 'act-' + Date.now(),
      text: newActionText.trim(),
      completed: false,
      targetDate: newActionDate || undefined
    }

    onUpdateBook({
      ...book,
      actionItems: [...book.actionItems, newAction],
      updatedAt: new Date().toISOString()
    })

    setNewActionText('')
    setNewActionDate('')
  }

  // Toggle Action Item
  const handleToggleAction = (actionId: string) => {
    onUpdateBook({
      ...book,
      actionItems: book.actionItems.map((act) =>
        act.id === actionId
          ? {
              ...act,
              completed: !act.completed,
              completedAt: !act.completed ? new Date().toISOString().slice(0, 10) : undefined
            }
          : act
      ),
      updatedAt: new Date().toISOString()
    })
  }

  // Delete Action Item
  const handleDeleteAction = (actionId: string) => {
    onUpdateBook({
      ...book,
      actionItems: book.actionItems.filter((act) => act.id !== actionId),
      updatedAt: new Date().toISOString()
    })
  }

  // Remove AI Insight
  const handleDeleteAiInsight = (insightId: string) => {
    onUpdateBook({
      ...book,
      aiInsights: book.aiInsights.filter((ins) => ins.id !== insightId),
      updatedAt: new Date().toISOString()
    })
  }

  // Reading Days Duration
  const readingDuration = () => {
    if (!book.startDate) return null
    const start = new Date(book.startDate)
    const end = book.completedDate ? new Date(book.completedDate) : new Date()
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)))
    return `${diffDays}일간 독서`
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-6 border-b border-[var(--border-color)] flex items-start justify-between gap-4 bg-[var(--bg-surface-secondary)]">
          <div className="flex gap-4 items-start">
            {/* Cover Image */}
            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-[var(--border-color)] bg-zinc-800">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLElement).style.display = 'none'
                }}
              />
            </div>

            {/* Book Meta & Status */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {book.category}
                </span>
                {book.isFavorite && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    ❤️ 인생책
                  </span>
                )}
                {book.isbn && (
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    ISBN: {book.isbn}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-snug">
                {book.title}
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                {book.author} {book.translator ? `(옮긴이: ${book.translator})` : ''} · {book.publisher}
              </p>

              {/* Status Selector & Dates */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <select
                  value={book.status}
                  onChange={(e) => handleStatusChange(e.target.value as ReadingStatus)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="reading">📖 읽는 중</option>
                  <option value="completed">✅ 완독 완료</option>
                  <option value="wishlist">🔖 읽고 싶은 책</option>
                  <option value="paused">⏸️ 잠시 멈춤</option>
                </select>

                {book.startDate && (
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {book.startDate} {book.completedDate ? `~ ${book.completedDate}` : '(독서 중)'}
                    {readingDuration() && ` · ${readingDuration()}`}
                  </span>
                )}

                {/* Yes24 Link */}
                {book.yes24Url && (
                  <a
                    href={book.yes24Url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Yes24 보기</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Close & AI Discussion */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenAiDiscussion(book)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
              title="AI와 책에 대해 심층 토론하기"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI 심층 토론</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/30 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 sm:px-6 bg-[var(--bg-surface)]">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('journal')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'journal'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>독서 기록 & 서평</span>
            </button>

            <button
              onClick={() => setActiveTab('quotes')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'quotes'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <QuoteIcon className="w-4 h-4" />
              <span>밑줄 & 문장 ({book.quotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'actions'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              <span>실천 액션 ({book.actionItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === 'info'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>목차 & 책 정보</span>
            </button>
          </div>

          {/* Reading Progress Bar in Header */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">진행도:</span>
            <input
              type="number"
              min="0"
              max={book.totalPages}
              value={book.currentPage}
              onChange={(e) => handleProgressChange(parseInt(e.target.value) || 0)}
              className="w-14 px-1.5 py-0.5 text-center text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-surface-secondary)]"
            />
            <span className="text-[var(--text-muted)]">/ {book.totalPages}p</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              ({Math.round((book.currentPage / (book.totalPages || 1)) * 100)}%)
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-190px)] space-y-6">
          
          {/* TAB 1: 독서 기록 및 서평 (Journal & Review) */}
          {activeTab === 'journal' && (
            <div className="space-y-6">
              
              {/* Star Rating & One-Liner Box */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">나의 평점:</span>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const newRating = book.review.rating === star ? star - 0.5 : star
                            const updatedReview = { ...book.review, rating: newRating }
                            setEditedReview(updatedReview)
                            onUpdateBook({ ...book, review: updatedReview, updatedAt: new Date().toISOString() })
                          }}
                          className="hover:scale-110 transition-transform text-lg"
                        >
                          {book.review.rating >= star ? '★' : book.review.rating >= star - 0.5 ? '⯪' : '☆'}
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {book.review.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                  <p className="font-serif italic text-sm sm:text-base text-[var(--text-primary)] font-medium">
                    "{book.review.oneLiner || '한 줄 총평을 남겨보세요.'}"
                  </p>
                </div>

                <button
                  onClick={() => setIsEditingReview(!isEditingReview)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-amber-500 text-xs font-medium text-[var(--text-secondary)] hover:text-amber-600 self-start sm:self-center transition-all flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingReview ? '작성 취소' : '서평 작성/수정'}</span>
                </button>
              </div>

              {/* Review Editor Form (when editing) */}
              {isEditingReview ? (
                <div className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-[var(--bg-surface-secondary)] space-y-4">
                  <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4" />
                    <span>구조화 독서 감상문 작성</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      🌟 한 줄 총평
                    </label>
                    <input
                      type="text"
                      value={editedReview.oneLiner}
                      onChange={(e) => setEditedReview({ ...editedReview, oneLiner: e.target.value })}
                      placeholder="이 책을 관통하는 나만의 한 줄 평가"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        🎯 [읽게 된 계기]
                      </label>
                      <textarea
                        rows={3}
                        value={editedReview.motivation}
                        onChange={(e) => setEditedReview({ ...editedReview, motivation: e.target.value })}
                        placeholder="어떤 호기심이나 필요로 이 책을 읽게 되었는가?"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        💡 [핵심 요약 & 주요 수식/개념] (LaTeX 지원)
                      </label>
                      <textarea
                        rows={3}
                        value={editedReview.summary}
                        onChange={(e) => setEditedReview({ ...editedReview, summary: e.target.value })}
                        placeholder="저자가 전달하고자 하는 핵심 논리와 수식 ($...$ / $$...$$)"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        💭 [나의 감상 & 생각의 변화]
                      </label>
                      <textarea
                        rows={4}
                        value={editedReview.impression}
                        onChange={(e) => setEditedReview({ ...editedReview, impression: e.target.value })}
                        placeholder="내 삶과 가치관에 어떤 울림과 변화를 주었는가?"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                        🤝 [추천 대상]
                      </label>
                      <textarea
                        rows={4}
                        value={editedReview.recommendation}
                        onChange={(e) => setEditedReview({ ...editedReview, recommendation: e.target.value })}
                        placeholder="어떤 고민이나 상황에 있는 사람에게 이 책을 추천하고 싶은가?"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      📝 자유 서식 독서록 & 수식 노트 (Markdown / LaTeX)
                    </label>
                    <textarea
                      rows={5}
                      value={editedReview.rawMarkdown || ''}
                      onChange={(e) => setEditedReview({ ...editedReview, rawMarkdown: e.target.value })}
                      placeholder="자유롭게 기록할 메모나 증명 과정, 수식 유도 ($...$, $$...$$)"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingReview(false)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveReview}
                      className="px-4 py-1.5 text-xs rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                      저장하기
                    </button>
                  </div>
                </div>
              ) : (
                /* Structured Review Display */
                <div className="space-y-4">
                  {book.review.motivation && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                        🎯 [읽게 된 계기]
                      </h4>
                      <LatexRenderer content={book.review.motivation} className="text-xs sm:text-sm text-[var(--text-secondary)]" />
                    </div>
                  )}

                  {book.review.summary && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                        💡 [핵심 요약 & 주요 수식]
                      </h4>
                      <LatexRenderer content={book.review.summary} className="text-xs sm:text-sm text-[var(--text-secondary)]" />
                    </div>
                  )}

                  {book.review.impression && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                        💭 [나의 감상 & 울림]
                      </h4>
                      <LatexRenderer content={book.review.impression} className="text-xs sm:text-sm text-[var(--text-secondary)]" />
                    </div>
                  )}

                  {book.review.recommendation && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                        🤝 [추천 대상]
                      </h4>
                      <LatexRenderer content={book.review.recommendation} className="text-xs sm:text-sm text-[var(--text-secondary)]" />
                    </div>
                  )}

                  {book.review.rawMarkdown && (
                    <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                      <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                        📝 [자유 서평 & 수식 노트]
                      </h4>
                      <LatexRenderer content={book.review.rawMarkdown} className="text-xs sm:text-sm text-[var(--text-secondary)]" />
                    </div>
                  )}

                  {!book.review.motivation && !book.review.summary && !book.review.impression && (
                    <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--bg-surface-secondary)]">
                      <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)] mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm text-[var(--text-muted)]">
                        아직 작성된 상세 독서 기록이 없습니다.
                      </p>
                      <button
                        onClick={() => setIsEditingReview(true)}
                        className="mt-3 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 text-white hover:bg-amber-700"
                      >
                        첫 독서 감상문 작성하기
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================================================
                  REQUIREMENT 5: AI 심층 토론 및 핵심 통찰 정리 섹션 (Saved at bottom)
                  ========================================================================= */}
              <div className="pt-4 border-t-2 border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[var(--text-primary)]">
                        💡 AI 심층 토론 & 핵심 통찰 정리 (AI Insights)
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        책을 열 때 참고할 수 있도록 AI와 나눈 심층 대화의 핵심 요약이 아래에 보관됩니다.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenAiDiscussion(book)}
                    className="px-3 py-1 text-xs rounded-lg border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium flex items-center gap-1 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>새 토론 시작</span>
                  </button>
                </div>

                {book.aiInsights && book.aiInsights.length > 0 ? (
                  <div className="space-y-4">
                    {book.aiInsights.map((insight) => (
                      <div key={insight.id} className="ai-insight-box">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                            {insight.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {new Date(insight.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                            <button
                              onClick={() => handleDeleteAiInsight(insight.id)}
                              className="text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                              title="통찰 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Summary with LaTeX */}
                        <LatexRenderer
                          content={insight.summary}
                          className="text-xs sm:text-sm text-[var(--text-secondary)] mb-3"
                        />

                        {/* Key Points */}
                        {insight.keyPoints && insight.keyPoints.length > 0 && (
                          <div className="mb-3">
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                              📌 핵심 배운 점 & 통찰:
                            </span>
                            <ul className="space-y-1 pl-4 list-disc text-xs text-[var(--text-secondary)]">
                              {insight.keyPoints.map((pt, idx) => (
                                <li key={idx}>
                                  <LatexRenderer content={pt} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Mathematical Formulas */}
                        {insight.mathematicalFormulas && insight.mathematicalFormulas.length > 0 && (
                          <div className="mb-3">
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                              📐 도출된 수학/공학 수식:
                            </span>
                            <div className="space-y-1.5">
                              {insight.mathematicalFormulas.map((formula, idx) => (
                                <LatexRenderer key={idx} content={`$$${formula}$$`} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Ideas */}
                        {insight.actionIdeas && insight.actionIdeas.length > 0 && (
                          <div>
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                              🚀 후속 실천 & 탐구 아이디어:
                            </span>
                            <ul className="space-y-0.5 pl-4 list-disc text-xs text-[var(--text-secondary)]">
                              {insight.actionIdeas.map((idea, idx) => (
                                <li key={idx}>{idea}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                      아직 저장된 AI 심층 토론 통찰이 없습니다.
                    </p>
                    <button
                      onClick={() => onOpenAiDiscussion(book)}
                      className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>책에 대해 AI와 토론하고 핵심 통찰 저장하기</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: 밑줄 & 문장 수집함 (Quotes) */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              {/* Add Quote Form */}
              <form onSubmit={handleAddQuote} className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] space-y-3">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>새로운 밑줄 문장 추가</span>
                </h4>

                <div className="flex gap-2">
                  <div className="w-24">
                    <input
                      type="text"
                      placeholder="쪽수 (p.42)"
                      value={newQuotePage}
                      onChange={(e) => setNewQuotePage(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="책 속의 인상 깊은 문장을 입력하세요... (수식 $...$ 가능)"
                      value={newQuoteText}
                      onChange={(e) => setNewQuoteText(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="이 문장을 읽고 든 나의 생각이나 메모..."
                    value={newQuoteNote}
                    onChange={(e) => setNewQuoteNote(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all"
                  >
                    문장 저장
                  </button>
                </div>
              </form>

              {/* Quote List */}
              <div className="space-y-3">
                {book.quotes.length > 0 ? (
                  book.quotes.map((quote) => (
                    <div key={quote.id} className="quote-card group">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          {quote.page && (
                            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                              p.{quote.page}
                            </span>
                          )}
                          <div className="font-serif text-sm sm:text-base text-[var(--text-primary)] italic mb-1.5">
                            <LatexRenderer content={`"${quote.content}"`} />
                          </div>
                          {quote.note && (
                            <div className="text-xs text-[var(--text-secondary)] pl-2 border-l-2 border-[var(--border-color)]">
                              <LatexRenderer content={quote.note} />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenQuoteCard(quote, book)}
                            className="p-1.5 rounded text-[var(--text-muted)] hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                            title="엽서 카드 만들기"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="p-1.5 rounded text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="문장 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-[var(--text-muted)]">
                    수집된 문장이 없습니다. 마음에 와닿는 구절을 추가해보세요.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 실천 액션 플랜 (Action Items) */}
          {activeTab === 'actions' && (
            <div className="space-y-6">
              {/* Add Action Form */}
              <form onSubmit={handleAddAction} className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] space-y-3">
                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>독서 후 삶에 실천할 액션 아이템 추가</span>
                </h4>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="이 책을 읽고 내 삶/업무에 적용할 구체적 행동..."
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="date"
                    value={newActionDate}
                    onChange={(e) => setNewActionDate(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-all"
                  >
                    추가
                  </button>
                </div>
              </form>

              {/* Action Items List */}
              <div className="space-y-2">
                {book.actionItems.length > 0 ? (
                  book.actionItems.map((act) => (
                    <div
                      key={act.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        act.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-[var(--text-muted)]'
                          : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleToggleAction(act.id)}>
                        <button type="button" className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                          {act.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-[var(--text-muted)]" />}
                        </button>
                        <div>
                          <p className={`text-xs sm:text-sm font-medium ${act.completed ? 'line-through opacity-70' : ''}`}>
                            {act.text}
                          </p>
                          {act.targetDate && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                              목표일: {act.targetDate}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAction(act.id)}
                        className="text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-[var(--text-muted)]">
                    등록된 실천 액션이 없습니다.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 목차 & 도서 기본 정보 (Info & TOC) */}
          {activeTab === 'info' && (
            <div className="space-y-4 text-xs sm:text-sm text-[var(--text-secondary)]">
              {book.toc && (
                <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2 font-serif">📚 도서 목차</h4>
                  <pre className="font-sans whitespace-pre-wrap text-xs leading-relaxed text-[var(--text-secondary)]">
                    {book.toc}
                  </pre>
                </div>
              )}

              {book.description && (
                <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)]">
                  <h4 className="font-bold text-[var(--text-primary)] mb-2 font-serif">📖 책 소개</h4>
                  <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Danger Zone: Delete Book */}
              <div className="pt-4 border-t border-[var(--border-color)] flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">서재에서 이 도서를 완전히 삭제합니다.</span>
                <button
                  onClick={() => {
                    if (window.confirm(`정말로 "${book.title}" 도서를 서재에서 삭제하시겠습니까?`)) {
                      onDeleteBook(book.id)
                      onClose()
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-all"
                >
                  도서 삭제
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
