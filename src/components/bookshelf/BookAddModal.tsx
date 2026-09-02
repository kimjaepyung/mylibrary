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
  Palette,
  CheckCircle2
} from 'lucide-react'
import { Book, ReadingStatus, Yes24SearchResult, AppSettings } from '../../types/book'
import { searchBooksFromYes24 } from '../../services/yes24Api'

interface BookAddModalProps {
  onClose: () => void
  onAddBook: (newBook: Book) => void
  settings?: AppSettings
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

const QUICK_SEARCH_KEYWORDS = [
  '미적분',
  '코스모스',
  '클린 코드',
  '소년이 온다',
  '사피엔스',
  '세이노의 가르침',
  '이기적 유전자',
  '페르마의 마지막 정리'
]

export const BookAddModal: React.FC<BookAddModalProps> = ({ onClose, onAddBook, settings }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Yes24SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null)

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
  const [category, setCategory] = useState('수학/과학')
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
  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault()
    const queryToUse = customQuery !== undefined ? customQuery : searchQuery
    if (!queryToUse.trim()) return

    if (customQuery !== undefined) {
      setSearchQuery(customQuery)
    }

    setIsSearching(true)
    setHasSearched(true)
    setSelectedResultIndex(null)

    try {
      const results = await searchBooksFromYes24(queryToUse, settings)
      setSearchResults(results)
    } catch (err) {
      console.error('Book search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Select Search Result
  const handleSelectBook = (bookInfo: Yes24SearchResult, index: number) => {
    setSelectedResultIndex(index)
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

    // Auto-fill tags from category
    if (bookInfo.category && !tagsInput) {
      setTagsInput(bookInfo.category)
    }
  }

  // Handle Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) {
      alert('도서 제목과 저자를 입력해주세요.')
      return
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const newBook: Book = {
      id: 'book-' + Date.now(),
      title: title.trim(),
      author: author.trim(),
      translator: translator.trim() || undefined,
      publisher: publisher.trim() || '출판사 미상',
      publishDate: publishDate || undefined,
      isbn: isbn.trim() || undefined,
      yes24Url: yes24Url.trim() || (isbn ? `https://www.yes24.com/Product/Search?domain=ALL&query=${isbn.trim()}` : undefined),
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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                새 도서 등록 & Yes24 검색
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                도서명/저자/ISBN/Yes24 링크를 검색하면 여러 권의 책 정보가 조회되며, 원하는 책을 클릭하여 자동 입력할 수 있습니다.
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
          
          {/* Section 1: Yes24 & ISBN Multi-Search Bar */}
          <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                <span>도서 검색 (Yes24 / ISBN / 제목 / 저자)</span>
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                키워드 입력 후 [검색]을 누르세요
              </span>
            </div>

            <form onSubmit={(e) => handleSearch(e)} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="예: 미적분, 코스모스, 클린 코드, 한강, 9788934971870, or Yes24 URL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-sm"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>검색</span>
              </button>
            </form>

            {/* Quick Search Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-[var(--text-muted)]">추천 검색어:</span>
              {QUICK_SEARCH_KEYWORDS.map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => handleSearch(undefined, kw)}
                  className="px-2 py-0.5 rounded-full text-[11px] bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-amber-500 hover:text-amber-600 text-[var(--text-secondary)] transition-all"
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Search Results Multi-Book Drawer */}
            {hasSearched && (
              <div className="mt-3 pt-3 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>검색 결과 ({searchResults.length}권 발견):</span>
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    원하는 도서를 클릭하면 아래 입력창에 즉시 자동 입력됩니다.
                  </span>
                </div>

                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 sm:max-h-80 overflow-y-auto pr-1">
                    {searchResults.map((result, idx) => {
                      const isSelected = selectedResultIndex === idx

                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectBook(result, idx)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start group relative ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 shadow-sm ring-1 ring-amber-500/50'
                              : 'bg-[var(--bg-surface)] border-[var(--border-color)] hover:border-amber-500/60 hover:bg-amber-500/5'
                          }`}
                        >
                          {/* Book Thumbnail */}
                          <div className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-zinc-800 shadow-sm border border-[var(--border-color)]">
                            <img
                              src={result.coverUrl}
                              alt={result.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'
                              }}
                            />
                          </div>

                          {/* Book Meta */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                {result.category || '도서'}
                              </span>
                              {result.publishDate && (
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {result.publishDate.slice(0, 4)}년
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight group-hover:text-amber-600 line-clamp-1">
                              {result.title}
                            </h4>
                            <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                              {result.author} · {result.publisher}
                            </p>

                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-[var(--border-color)]/60 text-[10px]">
                              <span className="font-mono text-[var(--text-muted)]">
                                {result.isbn ? `ISBN: ${result.isbn}` : `${result.totalPages || 300}p`}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {result.yes24Url && (
                                  <a
                                    href={result.yes24Url}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-[var(--text-muted)] hover:text-amber-600 flex items-center gap-0.5"
                                    title="Yes24에서 확인"
                                  >
                                    <span>Yes24</span>
                                    <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                                <span className={`font-semibold flex items-center gap-0.5 ${isSelected ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {isSelected ? <CheckCircle2 className="w-3 h-3" /> : '선택'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--text-muted)] py-2 text-center">
                    검색 결과가 없습니다. 아래 입력창에서 직접 정보를 입력하실 수 있습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Book Details Form */}
          <form id="book-add-form" onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 border-b border-[var(--border-color)] pb-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>도서 세부 정보 확인 및 편집</span>
            </h4>
            
            {/* Title & Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  도서 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 미적분으로 바라본 하루"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  저자 (지은이) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 오스카 E. 페르난데스"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Translator, Publisher, Publish Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  옮긴이 (번역)
                </label>
                <input
                  type="text"
                  placeholder="예: 김수환"
                  value={translator}
                  onChange={(e) => setTranslator(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  출판사
                </label>
                <input
                  type="text"
                  placeholder="예: 김영사"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  출간일
                </label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* ISBN & Yes24 Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  ISBN (10자리 또는 13자리)
                </label>
                <input
                  type="text"
                  placeholder="예: 9788934971870"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Yes24 도서 링크 URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.yes24.com/Product/Goods/..."
                  value={yes24Url}
                  onChange={(e) => setYes24Url(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Cover URL & Total Pages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  표지 이미지 URL
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  총 페이지 수 *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={totalPages}
                  onChange={(e) => setTotalPages(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  카테고리 *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value="수학/과학">수학/과학 (LaTeX 수식 특화)</option>
                  <option value="컴퓨터/IT">컴퓨터/IT (소프트웨어 공학)</option>
                  <option value="인문/철학">인문/철학 (사유와 고전)</option>
                  <option value="문학/소설">문학/소설</option>
                  <option value="경제/경영">경제/경영</option>
                  <option value="자기계발">자기계발</option>
                  <option value="역사/문화">역사/문화</option>
                  <option value="예술/디자인">예술/디자인</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  태그 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  placeholder="예: 미적분, 물리학, 교양수학"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Reading Status & Dates */}
            <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    독서 상태
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ReadingStatus)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold"
                  >
                    <option value="completed">✅ 완독 완료</option>
                    <option value="reading">📖 읽는 중</option>
                    <option value="wishlist">🔖 읽고 싶은 책 (위시)</option>
                    <option value="paused">⏸️ 잠시 멈춤</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    독서 시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>

                {status === 'completed' && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                      완독일
                    </label>
                    <input
                      type="date"
                      value={completedDate}
                      onChange={(e) => setCompletedDate(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </div>
                )}
              </div>

              {/* Rating & Favorite */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">나의 평점:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`text-base hover:scale-110 transition-transform ${
                          rating >= star ? 'text-amber-500' : 'text-zinc-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-600">{rating}점</span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-rose-600 dark:text-rose-400">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>❤️ 내 인생책으로 등록</span>
                </label>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="한 줄 총평 (예: 세상을 바라보는 시야를 완전히 바꿔준 책)"
                  value={oneLiner}
                  onChange={(e) => setOneLiner(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] italic font-serif"
                />
              </div>
            </div>

            {/* 3D Spine Color Palette */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                <span>3D 책장 책등 색상 선택</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {SPINE_COLORS.map((col) => (
                  <button
                    key={col.bg}
                    type="button"
                    onClick={() => {
                      setSpineColor(col.bg)
                      setSpineTextColor(col.text)
                    }}
                    style={{ backgroundColor: col.bg, color: col.text }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 transition-all ${
                      spineColor === col.bg ? 'ring-2 ring-amber-500 scale-105 shadow-md' : 'border-transparent opacity-85 hover:opacity-100'
                    }`}
                  >
                    {spineColor === col.bg && <Check className="w-3 h-3" />}
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description & TOC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  책 소개
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="도서의 주요 줄거리나 핵심 주제"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  도서 목차
                </label>
                <textarea
                  rows={3}
                  value={toc}
                  onChange={(e) => setToc(e.target.value)}
                  placeholder="주요 목차 정보"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </form>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-secondary)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] transition-all"
          >
            취소
          </button>
          <button
            type="submit"
            form="book-add-form"
            className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>서재에 도서 등록하기</span>
          </button>
        </div>

      </div>
    </div>
  )
}
