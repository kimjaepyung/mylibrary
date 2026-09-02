import React, { useState } from 'react'
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Quote as QuoteIcon,
  Palette,
  Bookmark
} from 'lucide-react'
import { Book, Quote } from '../../types/book'
import { LatexRenderer } from '../common/LatexRenderer'

interface QuoteCardModalProps {
  quote: Quote
  book: Book
  onClose: () => void
}

const CARD_THEMES = [
  {
    id: 'linen',
    name: '크림 린넨',
    bg: '#faf7f2',
    border: '#e6ded3',
    text: '#2d241e',
    accent: '#b45309',
    muted: '#78716c'
  },
  {
    id: 'indigo',
    name: '미드나잇 인디고',
    bg: '#0f172a',
    border: '#1e293b',
    text: '#f8fafc',
    accent: '#fbbf24',
    muted: '#94a3b8'
  },
  {
    id: 'forest',
    name: '포레스트 에메랄드',
    bg: '#064e3b',
    border: '#065f46',
    text: '#ecfdf5',
    accent: '#34d399',
    muted: '#a7f3d0'
  },
  {
    id: 'sunset',
    name: '선셋 버건디',
    bg: '#4c0519',
    border: '#881337',
    text: '#fff1f2',
    accent: '#fda4af',
    muted: '#fecdd3'
  }
]

export const QuoteCardModal: React.FC<QuoteCardModalProps> = ({ quote, book, onClose }) => {
  const [selectedTheme, setSelectedTheme] = useState(CARD_THEMES[0])
  const [copied, setCopied] = useState(false)

  const handleCopyText = () => {
    const text = `"${quote.content}"\n\n— 『${book.title}』 (${book.author}${quote.page ? `, p.${quote.page}` : ''})`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-secondary)]">
          <div className="flex items-center gap-2">
            <QuoteIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="font-serif font-bold text-base text-[var(--text-primary)]">
              감성 독서 엽서 카드
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 flex flex-col items-center">
          
          {/* Postcard Rendering Card */}
          <div
            id="reading-postcard"
            style={{
              backgroundColor: selectedTheme.bg,
              borderColor: selectedTheme.border,
              color: selectedTheme.text
            }}
            className="w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-xl flex flex-col justify-between min-h-[300px] transition-all relative overflow-hidden"
          >
            {/* Top decorative bookmark */}
            <div className="flex items-center justify-between opacity-80 mb-4">
              <span
                style={{ color: selectedTheme.accent }}
                className="text-[11px] font-serif uppercase tracking-widest font-bold flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>My Reading Journal</span>
              </span>
              {quote.page && (
                <span className="text-xs font-mono opacity-70">
                  p.{quote.page}
                </span>
              )}
            </div>

            {/* Center: Quote with LaTeX math equation support */}
            <div className="my-auto py-3">
              <div className="font-serif italic text-base sm:text-lg leading-relaxed font-medium">
                <LatexRenderer content={`"${quote.content}"`} />
              </div>
              {quote.note && (
                <div
                  style={{ borderColor: selectedTheme.accent, color: selectedTheme.muted }}
                  className="mt-4 pt-3 border-t text-xs font-sans italic"
                >
                  <LatexRenderer content={quote.note} />
                </div>
              )}
            </div>

            {/* Bottom: Book Info & Author */}
            <div className="mt-6 pt-4 border-t border-current/10 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-serif font-bold tracking-tight">
                  『{book.title}』
                </h4>
                <p style={{ color: selectedTheme.muted }} className="text-[11px] mt-0.5">
                  {book.author} · {book.publisher}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full border border-current/20 flex items-center justify-center opacity-60">
                📖
              </div>
            </div>
          </div>

          {/* Theme Selector Palette */}
          <div className="w-full flex items-center justify-center gap-2">
            {CARD_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                style={{ backgroundColor: theme.bg, borderColor: theme.accent }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedTheme.id === theme.id ? 'scale-125 ring-2 ring-amber-500' : 'opacity-70 hover:opacity-100'
                }`}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)]">
            SNS 및 메신저에 인용구를 공유해보세요.
          </span>
          <button
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '복사 완료!' : '텍스트 복사'}</span>
          </button>
        </div>

      </div>
    </div>
  )
}
