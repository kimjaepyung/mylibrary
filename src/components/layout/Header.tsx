import React from 'react'
import {
  BookOpen,
  Library,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  Search,
  Quote as QuoteIcon,
  Cloud,
  Moon,
  Sun,
  Flame
} from 'lucide-react'
import { AppSettings } from '../../types/book'

interface HeaderProps {
  currentTab: 'shelf' | 'timeline' | 'quotes' | 'stats'
  setCurrentTab: (tab: 'shelf' | 'timeline' | 'quotes' | 'stats') => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  categories: string[]
  totalBooksCount: number
  completedBooksCount: number
  annualGoal: number
  settings: AppSettings
  onOpenAddModal: () => void
  onOpenSettingsModal: () => void
  onToggleTheme: () => void
  onExportGoogleDrive: () => void
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  totalBooksCount,
  completedBooksCount,
  annualGoal,
  settings,
  onOpenAddModal,
  onOpenSettingsModal,
  onToggleTheme,
  onExportGoogleDrive
}) => {
  const goalPercentage = Math.min(100, Math.round((completedBooksCount / (annualGoal || 1)) * 100))

  return (
    <header className="app-header">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('shelf')}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-600/15 border border-amber-600/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
              <Library className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  나만의 개인 서재
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  AI Reading Journal
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] hidden sm:block">
                {settings.userNickname || '독서가'}님의 지적 여정과 완독 기록 아카이브
              </p>
            </div>
          </div>

          {/* Goal Tracker pill (middle on desktop) */}
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] text-xs">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span className="font-medium text-[var(--text-secondary)]">
              2026 독서 목표: <strong className="text-[var(--text-primary)]">{completedBooksCount}권</strong> / {annualGoal}권
            </span>
            <div className="w-16 h-2 rounded-full bg-[var(--border-color)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${goalPercentage}%` }}
              />
            </div>
            <span className="font-semibold text-amber-600 dark:text-amber-400">{goalPercentage}%</span>
          </div>

          {/* Action Buttons & Navigation */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Google Drive Backup Button (Requirement 8) */}
            <button
              onClick={onExportGoogleDrive}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[var(--border-color)] hover:border-amber-500/50 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-amber-600 transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Google Drive 백업 파일 다운로드"
            >
              <Cloud className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden lg:inline">드라이브 백업</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-color)] hover:border-amber-500/50 bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all"
              title="테마 변경 (우드 클래식 / 미드나잇 다크)"
            >
              {settings.theme === 'midnight' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettingsModal}
              className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-color)] hover:border-amber-500/50 bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-all"
              title="설정 (AI API 키, 목표, 구글 드라이브 복원)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Add Book Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>책 등록</span>
            </button>
          </div>
        </div>

        {/* Secondary Navigation & Search Bar */}
        <div className="py-2.5 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Main Tabs */}
          <nav className="flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setCurrentTab('shelf')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'shelf'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'
              }`}
            >
              <Library className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>서재 책장 ({totalBooksCount})</span>
            </button>

            <button
              onClick={() => setCurrentTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'timeline'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>독서 일지 타임라인</span>
            </button>

            <button
              onClick={() => setCurrentTab('quotes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'quotes'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'
              }`}
            >
              <QuoteIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>문장 수집함</span>
            </button>

            <button
              onClick={() => setCurrentTab('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'stats'
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>독서 통계</span>
            </button>
          </nav>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">전체 분야</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="책 제목, 저자, 수식, 키워드..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}
