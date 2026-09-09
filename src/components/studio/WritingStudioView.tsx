import React, { useState, useMemo, useRef } from 'react'
import {
  Feather,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  Check,
  FileText,
  Code2,
  Eye,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { Book, StudioDraft, Quote, AiDiscussionInsight } from '../../types/book'
import { LatexRenderer } from '../common/LatexRenderer'

interface WritingStudioViewProps {
  books: Book[]
  drafts: StudioDraft[]
  onSaveDrafts: (drafts: StudioDraft[]) => void
}

export const WritingStudioView: React.FC<WritingStudioViewProps> = ({
  books,
  drafts,
  onSaveDrafts
}) => {
  const [currentDraftId, setCurrentDraftId] = useState<string>(
    drafts.length > 0 ? drafts[0].id : ''
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [selectedBookId, setSelectedBookId] = useState<string>(
    books.length > 0 ? books[0].id : ''
  )
  const [sidebarTab, setSidebarTab] = useState<'quotes' | 'insights' | 'summary'>('quotes')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isSavedRecently, setIsSavedRecently] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Current active draft
  const currentDraft = useMemo(() => {
    return drafts.find((d) => d.id === currentDraftId) || drafts[0] || null
  }, [drafts, currentDraftId])

  // Selected book for knowledge vault
  const selectedBook = useMemo(() => {
    return books.find((b) => b.id === selectedBookId) || books[0] || null
  }, [books, selectedBookId])

  // Handle Title Change
  const handleTitleChange = (newTitle: string) => {
    if (!currentDraft) return
    const updated = drafts.map((d) =>
      d.id === currentDraft.id
        ? { ...d, title: newTitle, updatedAt: new Date().toISOString() }
        : d
    )
    onSaveDrafts(updated)
    triggerSavedBadge()
  }

  // Handle Content Change
  const handleContentChange = (newContent: string) => {
    if (!currentDraft) return
    const updated = drafts.map((d) =>
      d.id === currentDraft.id
        ? { ...d, content: newContent, updatedAt: new Date().toISOString() }
        : d
    )
    onSaveDrafts(updated)
    triggerSavedBadge()
  }

  const triggerSavedBadge = () => {
    setIsSavedRecently(true)
    setTimeout(() => setIsSavedRecently(false), 2000)
  }

  // Create New Draft
  const handleCreateNewDraft = () => {
    const newDraft: StudioDraft = {
      id: 'draft-' + Date.now(),
      title: `새 학술 초고 ${drafts.length + 1}`,
      content: `# 새 원고 제목\n\n> "이곳에 서재의 인용구 또는 핵심 가설을 적어보세요."\n\n## 1. 서론 및 문제 제기\n본 연구/칼럼에서는...\n\n$$\\mathbf{F} = m\\mathbf{a}$$\n`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    const updated = [newDraft, ...drafts]
    onSaveDrafts(updated)
    setCurrentDraftId(newDraft.id)
  }

  // Delete Draft
  const handleDeleteDraft = (idToDelete: string) => {
    if (drafts.length <= 1) {
      alert('최소 1개의 초고는 보관되어야 합니다.')
      return
    }
    if (!confirm('이 초고를 정말 삭제하시겠습니까?')) return

    const updated = drafts.filter((d) => d.id !== idToDelete)
    onSaveDrafts(updated)
    if (currentDraftId === idToDelete) {
      setCurrentDraftId(updated[0].id)
    }
  }

  // Insert text into editor at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    if (!textareaRef.current || !currentDraft) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentContent = currentDraft.content

    const newContent =
      currentContent.substring(0, start) +
      '\n' +
      textToInsert +
      '\n' +
      currentContent.substring(end)

    handleContentChange(newContent)

    setTimeout(() => {
      textarea.focus()
      const newPos = start + textToInsert.length + 2
      textarea.setSelectionRange(newPos, newPos)
    }, 50)
  }

  // Insert Quote
  const handleInsertQuote = (quote: Quote) => {
    if (!selectedBook) return
    const text = `> "${quote.content}"\n> — 『${selectedBook.title}』(p.${quote.page || '참조'}, ${selectedBook.author})`
    insertTextAtCursor(text)
    setCopiedId(quote.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Insert Insight
  const handleInsertInsight = (insight: AiDiscussionInsight) => {
    if (!selectedBook) return
    const points = insight.keyPoints.map((p) => `- ${p}`).join('\n')
    const text = `### 💡 ${insight.title} (from 『${selectedBook.title}』 AI 토론)\n${insight.summary}\n\n${points}`
    insertTextAtCursor(text)
    setCopiedId(insight.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Insert Summary
  const handleInsertSummary = () => {
    if (!selectedBook || !selectedBook.review) return
    const summary = selectedBook.review.summary || selectedBook.description || ''
    const text = `> **『${selectedBook.title}』 핵심 요약**:\n> ${summary}`
    insertTextAtCursor(text)
    setCopiedId('book-summary')
    setTimeout(() => setCopiedId(null), 1500)
  }

  // Export as Markdown (.md)
  const handleExportMarkdown = () => {
    if (!currentDraft) return
    const blob = new Blob([currentDraft.content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentDraft.title.replace(/[/\\?%*:|"<>]/g, '_')}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Export as LaTeX (.tex)
  const handleExportLatex = () => {
    if (!currentDraft) return
    const escapedTitle = currentDraft.title.replace(/([&%$#_{}])/g, '\\$1')
    
    // Convert common markdown headers to LaTeX sections
    let latexBody = currentDraft.content
      .replace(/^# (.+)$/gm, '\\section{$1}')
      .replace(/^## (.+)$/gm, '\\subsection{$1}')
      .replace(/^### (.+)$/gm, '\\subsubsection{$1}')
      .replace(/^> (.+)$/gm, '\\begin{quote}\n$1\n\\end{quote}')

    const texDocument = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{kotex}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{${escapedTitle}}
\\author{나만의 서재 연구원}
\\date{\\today}

\\begin{document}
\\maketitle

${latexBody}

\\end{document}
`
    const blob = new Blob([texDocument], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentDraft.title.replace(/[/\\?%*:|"<>]/g, '_')}.tex`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Stats calculation
  const charCount = currentDraft ? currentDraft.content.length : 0
  const wordCount = currentDraft
    ? currentDraft.content.trim().split(/\s+/).filter(Boolean).length
    : 0
  const lineCount = currentDraft ? currentDraft.content.split('\n').length : 0

  if (!currentDraft) {
    return (
      <div className="text-center py-20 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)]">
        <Feather className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3 opacity-40" />
        <h3 className="text-lg font-bold">보관된 집필 초고가 없습니다.</h3>
        <button
          onClick={handleCreateNewDraft}
          className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium"
        >
          첫 초고 작성하기
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[650px] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden">
      
      {/* 1. TOP TOOLBAR */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-app)]/60 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Draft Selector & Title Input */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? '지식 참조함 접기' : '지식 참조함 펼치기'}
            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)] transition-colors"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <select
            value={currentDraft.id}
            onChange={(e) => setCurrentDraftId(e.target.value)}
            aria-label="집필 초고 선택"
            className="text-xs font-medium py-1.5 px-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-amber-500 max-w-[180px] sm:max-w-[220px] truncate"
          >
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={currentDraft.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="초고 제목을 입력하세요..."
            className="flex-1 text-sm sm:text-base font-bold bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-amber-500 focus:outline-none px-2 py-0.5 text-[var(--text-primary)] transition-all"
          />

          {isSavedRecently && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium animate-fade-in">
              <Check className="w-3 h-3" />
              <span>저장됨</span>
            </span>
          )}
        </div>

        {/* Right: Actions (New, Export, Delete) */}
        <div className="flex items-center gap-2">
          {/* Document Stats Badge */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-color)]">
            <span>{charCount} 자</span>
            <span>•</span>
            <span>{wordCount} 단어</span>
            <span>•</span>
            <span>{lineCount} 줄</span>
          </div>

          <button
            onClick={handleCreateNewDraft}
            className="px-2.5 py-1.5 rounded-lg bg-amber-600/10 hover:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-600/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">새 초고</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={handleExportMarkdown}
            title="마크다운 파일(.md)로 다운로드"
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-amber-500 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>.MD</span>
          </button>

          <button
            onClick={handleExportLatex}
            title="LaTeX 학술 논문 규격 파일(.tex)로 다운로드"
            className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-amber-500 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-medium flex items-center gap-1.5 text-[var(--text-secondary)] transition-colors"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>.TEX</span>
          </button>

          <button
            onClick={() => handleDeleteDraft(currentDraft.id)}
            title="현재 초고 삭제"
            className="p-1.5 rounded-lg border border-[var(--border-color)] hover:bg-red-500/10 hover:border-red-500/30 text-[var(--text-muted)] hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE (SIDEBAR + SPLIT EDITOR) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT COLLAPSIBLE: Knowledge Vault Sidebar */}
        {isSidebarOpen && (
          <aside className="w-72 sm:w-80 border-r border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col shrink-0">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-[var(--border-color)] bg-[var(--bg-app)]/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>서재 지식 아카이브</span>
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">원클릭 인용</span>
              </div>

              {/* Book Picker */}
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                aria-label="인용할 도서 선택"
                className="w-full text-xs font-medium py-1.5 px-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    『{b.title}』 ({b.author})
                  </option>
                ))}
              </select>

              {/* Subtabs: Quotes vs AI Insights vs Summary */}
              <div className="grid grid-cols-3 gap-1 mt-2.5 bg-[var(--bg-app)] p-0.5 rounded-lg border border-[var(--border-color)] text-[11px]">
                <button
                  onClick={() => setSidebarTab('quotes')}
                  className={`py-1 rounded-md font-medium transition-all ${
                    sidebarTab === 'quotes'
                      ? 'bg-[var(--bg-surface)] text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  수집문장 ({selectedBook?.quotes?.length || 0})
                </button>
                <button
                  onClick={() => setSidebarTab('insights')}
                  className={`py-1 rounded-md font-medium transition-all ${
                    sidebarTab === 'insights'
                      ? 'bg-[var(--bg-surface)] text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  AI통찰 ({selectedBook?.aiInsights?.length || 0})
                </button>
                <button
                  onClick={() => setSidebarTab('summary')}
                  className={`py-1 rounded-md font-medium transition-all ${
                    sidebarTab === 'summary'
                      ? 'bg-[var(--bg-surface)] text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  책요약
                </button>
              </div>
            </div>

            {/* Sidebar Content List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {/* TAB 1: QUOTES */}
              {sidebarTab === 'quotes' && (
                <>
                  {selectedBook && selectedBook.quotes && selectedBook.quotes.length > 0 ? (
                    selectedBook.quotes.map((q) => (
                      <div
                        key={q.id}
                        className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)]/40 hover:border-amber-500/50 transition-all text-xs flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                            {q.page ? <span>p.{q.page}</span> : <span>발췌</span>}
                            <span>{q.date}</span>
                          </div>
                          <p className="font-serif italic text-[var(--text-primary)] line-clamp-3 leading-relaxed mb-1.5">
                            "{q.content}"
                          </p>
                          {q.note && (
                            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 pl-2 border-l border-amber-500/40">
                              {q.note}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleInsertQuote(q)}
                          className="mt-2 w-full py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-amber-500 hover:text-white hover:border-amber-500 font-medium text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          {copiedId === q.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>본문에 삽입됨!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>원고에 인용 삽입</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-[var(--text-muted)]">
                      『{selectedBook?.title}』에 수집된 문장이 없습니다.
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: AI INSIGHTS */}
              {sidebarTab === 'insights' && (
                <>
                  {selectedBook && selectedBook.aiInsights && selectedBook.aiInsights.length > 0 ? (
                    selectedBook.aiInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)]/40 hover:border-amber-500/50 transition-all text-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1">{insight.title}</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 mb-1.5 leading-relaxed">
                            {insight.summary}
                          </p>
                        </div>
                        <button
                          onClick={() => handleInsertInsight(insight)}
                          className="mt-1 w-full py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-amber-500 hover:text-white hover:border-amber-500 font-medium text-[11px] flex items-center justify-center gap-1 transition-all"
                        >
                          {copiedId === insight.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>본문에 삽입됨!</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>통찰 요약문 삽입</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-xs text-[var(--text-muted)]">
                      저장된 AI 심층 토론 통찰이 없습니다.
                    </div>
                  )}
                </>
              )}

              {/* TAB 3: BOOK SUMMARY */}
              {sidebarTab === 'summary' && selectedBook && (
                <div className="p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-app)]/40 text-xs space-y-2">
                  <div className="font-bold text-[var(--text-primary)]">
                    『{selectedBook.title}』
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed max-h-48 overflow-y-auto">
                    {selectedBook.review?.summary || selectedBook.description || '작성된 요약이 없습니다.'}
                  </p>
                  <button
                    onClick={handleInsertSummary}
                    className="w-full py-1 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-amber-500 hover:text-white hover:border-amber-500 font-medium text-[11px] flex items-center justify-center gap-1 transition-all"
                  >
                    {copiedId === 'book-summary' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>본문에 삽입됨!</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>서평 요약문 삽입</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* RIGHT DUAL-PANE: EDITOR (LEFT) + LATEX RENDERED PREVIEW (RIGHT) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)] overflow-hidden">
          
          {/* PANE 1: MARKDOWN + LATEX INPUT EDITOR */}
          <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
            <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-app)]/30 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 font-medium">
                <Code2 className="w-3.5 h-3.5 text-amber-600" />
                <span>원고 편집기 (Markdown & LaTeX)</span>
              </span>
              <span className="text-[11px] font-mono">인라인 $...$ / 블록 $$...$$ 지원</span>
            </div>

            <textarea
              ref={textareaRef}
              value={currentDraft.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="이곳에 마크다운 및 LaTeX 수식을 자유롭게 작성하세요..."
              className="flex-1 w-full p-4 font-mono text-xs sm:text-sm bg-transparent text-[var(--text-primary)] resize-none focus:outline-none leading-relaxed overflow-y-auto selection:bg-amber-500/20"
              spellCheck={false}
            />
          </div>

          {/* PANE 2: LIVE LATEX / MARKDOWN PREVIEW */}
          <div className="flex flex-col h-full overflow-hidden bg-[var(--bg-surface)]">
            <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-app)]/30 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5 font-medium">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>실시간 LaTeX 렌더링 미리보기</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">
                KaTeX Live
              </span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto prose prose-stone dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed">
              {currentDraft.content.trim() ? (
                <div className="space-y-3">
                  <LatexRenderer content={currentDraft.content} />
                </div>
              ) : (
                <div className="text-center py-20 text-[var(--text-muted)] italic">
                  좌측 편집기에 작성한 내용과 수식이 이곳에 실시간 렌더링됩니다.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
