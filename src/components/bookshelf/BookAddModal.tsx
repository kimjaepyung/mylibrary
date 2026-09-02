import React, { useState } from 'react'
import {
  X,
  Search,
  BookOpen,
  Sparkles,
  ExternalLink,
  Check,
  Plus,
  Loader2,
  Calendar,
  Layers,
  Palette
} from 'lucide-react'
import { Book, ReadingStatus, Yes24SearchResult } from '../../types/book'
import { searchBooksFromYes24 } from '../../services/yes24Api'

interface BookAddModalProps {
  onClose: () => void
  onAddBook: (newBook: Book) => void
}

const SPINE_COLORS = [
  { name: '딥 네이비', bg: '#1e3a8a', text: '#93c5fd' },
  { name: '에메랄드 그린', bg: '#065f46', text: '#6ee7b7' },
  { name: '클래식 월넛', bg: '#5c3a21', text: '#fde68a' },
  { name: '로얄 인디고', bg: '#312e81', text: '#c7d2fe' },
  { name: '버건디 와인', bg: '#881337', text: '#fecdd3' },
  { name: '차콜 블랙', bg: '#18181b', text: '#e4e4e7' },
  { name: '앤틱 골드', bg: '#92400e', text: '#fef3c7' }
]

export const BookAddModal: React.FC<BookAddModalProps> = ({ onClose, onAddBook }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Yes24SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  // Form State
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [translator, setTranslator] = useState('')
  const [publisher, setPublisher] = useState('')
  const [publishDate, setPublishDate] = useState('')
  const [isbn, setIsbn] = useState('')
  const [yes24Url, setYes24Url] = useState('')
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80')
  const [totalPages, setTotalPages] = useState<number>(300)
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [category, setCategory] = useState('인문/철학')
  const [tagsInput, setTagsInput] = useState('')
  const [status, setStatus] = useState<ReadingStatus>('completed')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().slice(0, 10))
  const [rating, setRating] = useState(5)
  const [oneLiner, setOneLiner] = useState('')
  const [description, setDescription] = useState('')
  const [toc, setToc] = useState('')
  const [spineColor, setSpineColor] = useState(SPINE_COLORS[0].bg)
  const [spineTextColor, setSpineTextColor] = useState(SPINE_COLORS[0].text)
  const [isFavorite, setIsFavorite] = useState(false)

  // Handle Search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setHasSearched(true)
    try {
      const results = await searchBooksFromYes24(searchQuery)
      setSearchResults(results)
    } catch (err) {
      console.error('Book search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Select Search Result
  const handleSelectBook = (bookInfo: Yes24SearchResult) => {
    setTitle(bookInfo.title)
    setAuthor(bookInfo.author)
    setPublisher(bookInfo.publisher)
    setPublishDate(bookInfo.publishDate || '')
    setIsbn(bookInfo.isbn || '')
    setCoverUrl(bookInfo.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80')
    setTotalPages(bookInfo.totalPages || 300)
    setCurrentPage(status === 'completed' ? (bookInfo.totalPages || 300) : 0)
    setYes24Url(bookInfo.yes24Url || '')
    if (bookInfo.category) setCategory(bookInfo.category)
    if (bookInfo.description) setDescription(bookInfo.description)
    if (bookInfo.toc) setToc(bookInfo.toc)
  }

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) {
      alert('도서 제목과 저자를 입력해주세요.')
      return
    }

    const tags = tagsInput
      .split(/[,#\s]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const newBook: Book = {
      id: 'book-' + Date.now(),
      title: title.trim(),
      author: author.trim(),
      translator: translator.trim() || undefined,
      publisher: publisher.trim() || '출판사 미상',
      publishDate: publishDate.trim() || undefined,
      isbn: isbn.trim() || undefined,
      yes24Url: yes24Url.trim() || undefined,
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
      totalPages: totalPages > 0 ? totalPages : 300,
      currentPage: status === 'completed' ? (totalPages > 0 ? totalPages : 300) : currentPage,
      category,
      tags,
      status,
      isFavorite,
      startDate: status !== 'wishlist' ? startDate : undefined,
      completedDate: status === 'completed' ? completedDate : undefined,
      sessions:
        status === 'completed'
          ? [
              {
                id: 'sess-' + Date.now(),
                round: 1,
                startDate: startDate || new Date().toISOString().slice(0, 10),
                completedDate: completedDate || new Date().toISOString().slice(0, 10),
                notes: '초판 완독'
              }
            ]
          : [],
      review: {
        rating,
        oneLiner: oneLiner.trim(),
        motivation: '',
        summary: '',
        impression: '',
        recommendation: '',
        rawMarkdown: ''
      },
      quotes: [],
      actionItems: [],
      aiInsights: [],
      aiChatHistory: [],
      toc: toc.trim() || undefined,
      description: description.trim() || undefined,
      spineColor,
      spineTextColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onAddBook(newBook)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-3xl max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-secondary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                새 도서 등록 (Yes24 / ISBN 검색)
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Yes24 검색 또는 ISBN 입력으로 도서 정보를 자동으로 불러옵니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Section 1: Yes24 & ISBN Search Bar */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-amber-500/30 space-y-3">
            <label className="block text-xs font-bold text-amber-700 dark:text-amber-300">
              🔍 Yes24 도서명 / 저자 / ISBN / 링크 검색
            </label>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="예: 미적분으로 바라본 하루, 9788934971870, or Yes24 URL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>검색</span>
              </button>
            </form>

            {/* Search Results Drawer */}
            {hasSearched && (
              <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                <span className="text-xs font-semibold text-[var(--text-secondary)] block mb-2">
                  검색 결과 ({searchResults.length}건):
                </span>
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectBook(result)}
                        className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-amber-500/60 hover:bg-amber-500/5 cursor-pointer flex gap-3 items-center transition-all group"
                      >
                        <img
                          src={result.coverUrl}
                          alt={result.title}
                          referrerPolicy="no-referrer"
                          className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0 bg-zinc-800"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-amber-600">
                            {result.title}
                          </h4>
                          <p className="text-[11px] text-[var(--text-secondary)] truncate">
                            {result.author} · {result.publisher}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {result.isbn && (
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                {result.isbn}
                              </span>
                            )}
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                              [선택하기]
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] py-2">
                    검색 결과가 없습니다. 아래 입력창에서 직접 정보를 입력하실 수 있습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Book Details Form */}
          <form id="book-add-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  도서 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 코스모스"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  저자 (Author) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 칼 세이건"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Publisher, Publish Date, Translator, ISBN */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  출판사
                </label>
                <input
                  type="text"
                  placeholder="예: 사이언스북스"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  출간일
                </label>
                <input
                  type="text"
                  placeholder="예: 2026-01-15"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  옮긴이 (번역)
                </label>
                <input
                  type="text"
                  placeholder="예: 홍승수"
                  value={translator}
                  onChange={(e) => setTranslator(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  placeholder="13자리 번호"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                />
              </div>
            </div>

            {/* Total Pages, Category, Status, Favorite */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  총 페이지 수
                </label>
                <input
                  type="number"
                  min="1"
                  value={totalPages}
                  onChange={(e) => setTotalPages(parseInt(e.target.value) || 300)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  도서 분야/카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  <option value="수학/과학">수학/과학</option>
                  <option value="IT/공학">IT/공학</option>
                  <option value="인문/철학">인문/철학</option>
                  <option value="문학/소설">문학/소설</option>
                  <option value="경제/경영">경제/경영</option>
                  <option value="예술/문화">예술/문화</option>
                  <option value="자기계발">자기계발</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  독서 상태
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                  className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-amber-700 dark:text-amber-300"
                >
                  <option value="completed">✅ 완독 완료</option>
                  <option value="reading">📖 읽는 중</option>
                  <option value="wishlist">🔖 읽고 싶은 책</option>
                  <option value="paused">⏸️ 잠시 멈춤</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  인생책 (Favorite)
                </label>
                <button
                  type="button"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-full py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                    isFavorite
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  {isFavorite ? '❤️ 인생책 등록됨' : '🤍 일반 도서'}
                </button>
              </div>
            </div>

            {/* Reading Dates & Rating if Completed */}
            {status === 'completed' && (
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      독서 시작일
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      완독일
                    </label>
                    <input
                      type="date"
                      value={completedDate}
                      onChange={(e) => setCompletedDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      나의 평점 ({rating}점)
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="text-amber-500 text-lg hover:scale-110"
                        >
                          {rating >= s ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    한 줄 총평
                  </label>
                  <input
                    type="text"
                    placeholder="이 책에 대한 나만의 한 줄 요약평"
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-serif"
                  />
                </div>
              </div>
            )}

            {/* Book Spine Color Palette (For 3D Bookshelf View) */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                책등(Spine) 비주얼 색상 선택
              </label>
              <div className="flex gap-2">
                {SPINE_COLORS.map((col, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSpineColor(col.bg)
                      setSpineTextColor(col.text)
                    }}
                    style={{ backgroundColor: col.bg, color: col.text }}
                    className={`w-8 h-8 rounded-lg shadow-sm font-bold text-xs flex items-center justify-center transition-all ${
                      spineColor === col.bg ? 'ring-2 ring-amber-500 ring-offset-2 scale-110' : 'opacity-80'
                    }`}
                    title={col.name}
                  >
                    {spineColor === col.bg ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                태그 (쉼표 또는 띄어쓰기로 구분)
              </label>
              <input
                type="text"
                placeholder="예: 수학, 미적분, AI, 인생책"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-color)] flex justify-end gap-2.5 bg-[var(--bg-surface-secondary)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
          >
            취소
          </button>
          <button
            type="submit"
            form="book-add-form"
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all active:scale-95"
          >
            서재에 책 등록하기
          </button>
        </div>

      </div>
    </div>
  )
}
