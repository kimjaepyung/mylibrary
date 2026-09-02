import React, { useState, useEffect, useMemo } from 'react'
import {
  Book,
  AppSettings,
  Quote,
  ReadingStatus
} from './types/book'
import {
  loadBooks,
  saveBooks,
  loadSettings,
  saveSettings,
  downloadGoogleDriveBackupFile
} from './services/storage'
import { Header } from './components/layout/Header'
import { BookshelfView } from './components/bookshelf/BookshelfView'
import { ReadingDetailModal } from './components/journal/ReadingDetailModal'
import { BookAddModal } from './components/bookshelf/BookAddModal'
import { AiDiscussionModal } from './components/ai/AiDiscussionModal'
import { SettingsModal } from './components/settings/SettingsModal'
import { QuoteCardModal } from './components/quotes/QuoteCardModal'
import { ReadingStatsView } from './components/stats/ReadingStatsView'
import { LatexRenderer } from './components/common/LatexRenderer'
import { Quote as QuoteIcon, Share2, Search, Sparkles, BookOpen } from 'lucide-react'

export function App() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks())
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())

  const [currentTab, setCurrentTab] = useState<'shelf' | 'timeline' | 'quotes' | 'stats'>('shelf')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Modals state
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [aiDiscussionBook, setAiDiscussionBook] = useState<Book | null>(null)
  const [quoteCardData, setQuoteCardData] = useState<{ quote: Quote; book: Book } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  // Save books and settings to localStorage
  useEffect(() => {
    saveBooks(books)
  }, [books])

  useEffect(() => {
    saveSettings(settings)
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings])

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    books.forEach((b) => {
      if (b.category) set.add(b.category)
    })
    return Array.from(set)
  }, [books])

  const completedBooksCount = useMemo(
    () => books.filter((b) => b.status === 'completed').length,
    [books]
  )

  // Book CRUD Handlers
  const handleAddBook = (newBook: Book) => {
    setBooks([newBook, ...books])
    setDetailBook(newBook)
  }

  const handleUpdateBook = (updatedBook: Book) => {
    setBooks(books.map((b) => (b.id === updatedBook.id ? updatedBook : b)))
    if (detailBook && detailBook.id === updatedBook.id) {
      setDetailBook(updatedBook)
    }
    if (aiDiscussionBook && aiDiscussionBook.id === updatedBook.id) {
      setAiDiscussionBook(updatedBook)
    }
  }

  const handleDeleteBook = (bookId: string) => {
    setBooks(books.filter((b) => b.id !== bookId))
    if (detailBook && detailBook.id === bookId) setDetailBook(null)
    if (aiDiscussionBook && aiDiscussionBook.id === bookId) setAiDiscussionBook(null)
  }

  // Backup & Restore Handlers
  const handleExportGoogleDrive = () => {
    downloadGoogleDriveBackupFile(books, settings)
  }

  const handleRestoreBackup = (restoredBooks: Book[], restoredSettings: AppSettings) => {
    setBooks(restoredBooks)
    setSettings(restoredSettings)
  }

  const handleToggleTheme = () => {
    const nextTheme = settings.theme === 'wood' ? 'midnight' : 'wood'
    setSettings({ ...settings, theme: nextTheme })
  }

  // All Quotes flattened
  const allQuotes = useMemo(() => {
    const list: Array<{ quote: Quote; book: Book }> = []
    books.forEach((book) => {
      if (book.quotes && Array.isArray(book.quotes)) {
        book.quotes.forEach((q) => {
          list.push({ quote: q, book })
        })
      }
    })
    return list
  }, [books])

  const filteredQuotes = useMemo(() => {
    if (!searchQuery.trim()) return allQuotes
    const q = searchQuery.toLowerCase()
    return allQuotes.filter(
      (item) =>
        item.quote.content.toLowerCase().includes(q) ||
        item.quote.note?.toLowerCase().includes(q) ||
        item.book.title.toLowerCase().includes(q) ||
        item.book.author.toLowerCase().includes(q)
    )
  }, [allQuotes, searchQuery])

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col transition-colors duration-300">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        totalBooksCount={books.length}
        completedBooksCount={completedBooksCount}
        annualGoal={settings.annualGoal}
        settings={settings}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        onExportGoogleDrive={handleExportGoogleDrive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1 & 2: Bookshelf & Timeline */}
        {(currentTab === 'shelf' || currentTab === 'timeline') && (
          <BookshelfView
            books={books}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            onSelectBook={(book) => setDetailBook(book)}
            onOpenAiDiscussion={(book) => setAiDiscussionBook(book)}
          />
        )}

        {/* TAB 3: All Quotes Vault */}
        {currentTab === 'quotes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <QuoteIcon className="w-6 h-6 text-amber-600" />
                  <span>문장 수집함 (Quote Vault)</span>
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  완독한 도서들 속에서 건져 올린 지혜와 명문장 {allQuotes.length}개
                </p>
              </div>
            </div>

            {filteredQuotes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {filteredQuotes.map(({ quote, book }) => (
                  <div
                    key={quote.id}
                    className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Page & Book Title */}
                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                        <span
                          className="font-serif font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          onClick={() => setDetailBook(book)}
                        >
                          『{book.title}』
                        </span>
                        {quote.page && <span className="font-mono text-[11px]">p.{quote.page}</span>}
                      </div>

                      {/* Quote Content with LaTeX Math Equation Rendering */}
                      <div className="font-serif italic text-sm sm:text-base text-[var(--text-primary)] leading-relaxed mb-3">
                        <LatexRenderer content={`"${quote.content}"`} />
                      </div>

                      {/* Reader Note */}
                      {quote.note && (
                        <div className="text-xs text-[var(--text-secondary)] pl-3 border-l-2 border-amber-500/40 py-0.5">
                          <LatexRenderer content={quote.note} />
                        </div>
                      )}
                    </div>

                    {/* Bottom Author & Share Card */}
                    <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] font-medium">
                        {book.author}
                      </span>
                      <button
                        onClick={() => setQuoteCardData({ quote, book })}
                        className="px-2.5 py-1 rounded-lg border border-[var(--border-color)] hover:border-amber-500 hover:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium text-xs flex items-center gap-1 transition-all"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>엽서 카드 생성</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-[var(--bg-surface)] rounded-2xl border border-dashed border-[var(--border-color)]">
                <QuoteIcon className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2 opacity-40" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">
                  수집된 문장이 없습니다.
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  책 상세 화면에서 인상 깊었던 구절을 등록해보세요.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Stats View */}
        {currentTab === 'stats' && (
          <ReadingStatsView
            books={books}
            settings={settings}
            onSelectBook={(book) => setDetailBook(book)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-6 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>나만의 개인 서재 © 2026 My Reading Journal & AI Companion</span>
          <span>Google Drive Cloud Sync & Vercel Ready</span>
        </div>
      </footer>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      
      {/* 1. Book Detail Modal (with Requirement 5: AI Insights at bottom) */}
      {detailBook && (
        <ReadingDetailModal
          book={detailBook}
          onClose={() => setDetailBook(null)}
          onUpdateBook={handleUpdateBook}
          onDeleteBook={handleDeleteBook}
          onOpenAiDiscussion={(book) => {
            setAiDiscussionBook(book)
          }}
          onOpenQuoteCard={(quote, book) => {
            setQuoteCardData({ quote, book })
          }}
        />
      )}

      {/* 2. AI Discussion Modal */}
      {aiDiscussionBook && (
        <AiDiscussionModal
          book={aiDiscussionBook}
          settings={settings}
          onClose={() => setAiDiscussionBook(null)}
          onUpdateBook={handleUpdateBook}
          onOpenSettings={() => {
            setAiDiscussionBook(null)
            setIsSettingsModalOpen(true)
          }}
        />
      )}

      {/* 3. Book Add Modal (Yes24 / ISBN) */}
      {isAddModalOpen && (
        <BookAddModal
          settings={settings}
          onClose={() => setIsAddModalOpen(false)}
          onAddBook={handleAddBook}
        />
      )}

      {/* 4. Settings Modal (API Keys & Google Drive Backup) */}
      {isSettingsModalOpen && (
        <SettingsModal
          settings={settings}
          books={books}
          onClose={() => setIsSettingsModalOpen(false)}
          onSaveSettings={(newSettings) => setSettings(newSettings)}
          onRestoreBackup={handleRestoreBackup}
        />
      )}

      {/* 5. Quote Postcard Card Modal */}
      {quoteCardData && (
        <QuoteCardModal
          quote={quoteCardData.quote}
          book={quoteCardData.book}
          onClose={() => setQuoteCardData(null)}
        />
      )}

    </div>
  )
}
