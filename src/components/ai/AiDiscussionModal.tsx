import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Save,
  Loader2,
  HelpCircle,
  Settings,
  BookOpen,
  ArrowDownCircle,
  Check
} from 'lucide-react'
import { Book, AiMessage, AppSettings } from '../../types/book'
import { sendDiscussionMessage, generateDiscussionSummary } from '../../services/aiService'
import { LatexRenderer } from '../common/LatexRenderer'

interface AiDiscussionModalProps {
  book: Book
  settings: AppSettings
  onClose: () => void
  onUpdateBook: (updatedBook: Book) => void
  onOpenSettings: () => void
}

export const AiDiscussionModal: React.FC<AiDiscussionModalProps> = ({
  book,
  settings,
  onClose,
  onUpdateBook,
  onOpenSettings
}) => {
  const [messages, setMessages] = useState<AiMessage[]>(() => {
    if (book.aiChatHistory && book.aiChatHistory.length > 0) {
      return book.aiChatHistory
    }
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `안녕하세요! **"${book.title}"**(${book.author})에 대해 심층 토론을 나눌 AI 독서 파트너입니다. 🎓\n\n독자님께서 기록하신 평점과 서평, 밑줄 문장들을 토대로 깊이 있는 개념 분석, 수식 유도, 철학적 질문을 나눠보세요. 무엇이 가장 궁금하거나 논의하고 싶으신가요?`,
        timestamp: new Date().toISOString()
      }
    ]
  })

  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Quick Discussion Starters
  const discussionStarters = [
    `"${book.title}"의 핵심 논리를 수식 및 공학적 모델 관점에서 분석해줘`,
    `내가 밑줄 친 인용구와 서평에 대해 다른 시각에서의 비판이나 보완점을 제안해줘`,
    `이 책의 이론을 현실 프로젝트나 일상 문제 해결에 어떻게 적용할 수 있을까?`,
    `저자가 책에서 명시하지 않았지만 숨겨진 한계점이나 전제 조건은 무엇일까?`
  ]

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputText).trim()
    if (!prompt || isLoading) return

    const userMessage: AiMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    }

    const updatedHistory = [...messages, userMessage]
    setMessages(updatedHistory)
    setInputText('')
    setIsLoading(true)

    try {
      const aiResponseText = await sendDiscussionMessage(book, updatedHistory, prompt, settings)
      const aiMessage: AiMessage = {
        id: 'ai-' + (Date.now() + 1),
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toISOString()
      }

      const finalHistory = [...updatedHistory, aiMessage]
      setMessages(finalHistory)

      // Auto save chat history to book
      onUpdateBook({
        ...book,
        aiChatHistory: finalHistory,
        updatedAt: new Date().toISOString()
      })
    } catch (err: any) {
      const errorMessage: AiMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `⚠️ **오류 발생**: ${err.message || 'AI와 대화를 연결하지 못했습니다.'}\n\n우측 상단 ⚙️ 설정에서 API Key를 확인해주세요.`,
        timestamp: new Date().toISOString()
      }
      setMessages([...updatedHistory, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Requirement 5: Summarize discussion and save insight directly to book reference
  const handleSummarizeAndSave = async () => {
    if (messages.length <= 1 || isSummarizing) return
    setIsSummarizing(true)
    setSavedSuccess(false)

    try {
      const insight = await generateDiscussionSummary(book, messages, settings)
      
      const updatedInsights = [insight, ...(book.aiInsights || [])]
      onUpdateBook({
        ...book,
        aiInsights: updatedInsights,
        aiChatHistory: messages,
        updatedAt: new Date().toISOString()
      })

      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err: any) {
      alert(`요약 저장 중 오류가 발생했습니다: ${err.message}`)
    } finally {
      setIsSummarizing(false)
    }
  }

  const hasApiKey = Boolean(settings.geminiApiKey || settings.openaiApiKey)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-4xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                  AI 심층 독서 토론 & 사유 파트너
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-medium">
                  {settings.selectedAiProvider === 'gemini' ? 'Google Gemini' : 'OpenAI GPT'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                도서: <strong className="text-[var(--text-primary)]">{book.title}</strong> ({book.author})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Requirement 5 Button */}
            <button
              onClick={handleSummarizeAndSave}
              disabled={isSummarizing || messages.length <= 1}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50'
              }`}
              title="대화의 핵심 통찰을 요약하여 책 상세 화면 하단에 영구 저장합니다"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>요약 정리 중...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>책 하단 저장 완료!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>통찰 요약하여 책에 저장</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* API Key Missing Notice */}
        {!hasApiKey && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              API 키가 설정되지 않아 데모 모드로 동작 중입니다. 실시간 실서버 AI 추론을 위해 API 키를 등록하세요.
            </span>
            <button
              onClick={onOpenSettings}
              className="font-semibold underline hover:text-amber-900 dark:hover:text-amber-100 flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>설정하기</span>
            </button>
          </div>
        )}

        {/* Chat Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[var(--bg-app)]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-amber-600 text-white rounded-tr-none'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-tl-none'
                }`}
              >
                {/* LaTeX Equation Renderer for Math/Engineering and Regular text */}
                <LatexRenderer
                  content={msg.content}
                  className={`text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user' ? 'text-white font-medium' : ''
                  }`}
                />
                <span
                  className={`text-[10px] block mt-2 ${
                    msg.role === 'user' ? 'text-amber-200 text-right' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span>책의 맥락과 수식을 분석하며 답변을 작성 중입니다...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Discussion Starters Chips */}
        <div className="px-4 py-2 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex gap-2 overflow-x-auto">
          {discussionStarters.map((starter, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(starter)}
              disabled={isLoading}
              className="text-[11px] px-3 py-1.5 rounded-full border border-[var(--border-color)] hover:border-amber-500/50 hover:bg-amber-500/10 text-[var(--text-secondary)] whitespace-nowrap transition-all flex-shrink-0"
            >
              💡 {starter}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSendMessage()
          }}
          className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-surface)] flex gap-2 items-center"
        >
          <input
            type="text"
            placeholder="책에 대해 질문하거나 생각을 입력하세요... (LaTeX 수식 $...$ 가능)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-amber-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-40 transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  )
}
