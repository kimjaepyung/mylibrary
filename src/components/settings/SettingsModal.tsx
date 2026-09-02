import React, { useState, useRef } from 'react'
import {
  X,
  Settings,
  Key,
  Cloud,
  Download,
  Upload,
  Sparkles,
  Palette,
  Target,
  User,
  Check,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react'
import { AppSettings, Book } from '../../types/book'
import {
  downloadGoogleDriveBackupFile,
  parseBackupFile,
  SAMPLE_BOOKS
} from '../../services/storage'

interface SettingsModalProps {
  settings: AppSettings
  books: Book[]
  onClose: () => void
  onSaveSettings: (newSettings: AppSettings) => void
  onRestoreBackup: (restoredBooks: Book[], restoredSettings: AppSettings) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  books,
  onClose,
  onSaveSettings,
  onRestoreBackup
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings)
  const [isSaved, setIsSaved] = useState(false)
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveSettings(formData)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  // Google Drive Backup Download (Requirement 8)
  const handleExportGoogleDrive = () => {
    downloadGoogleDriveBackupFile(books, formData)
  }

  // Google Drive File Restore (Requirement 8)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setRestoreMessage(null)
    setRestoreError(null)

    try {
      const { books: loadedBooks, settings: loadedSettings } = await parseBackupFile(file)
      if (
        window.confirm(
          `백업 파일에서 ${loadedBooks.length}권의 도서 및 독서 기록을 복원하시겠습니까? 현재 서재 데이터가 덮어씌워집니다.`
        )
      ) {
        onRestoreBackup(loadedBooks, loadedSettings)
        setFormData(loadedSettings)
        setRestoreMessage(`성공적으로 ${loadedBooks.length}권의 도서 및 기록을 복원했습니다! 🎉`)
      }
    } catch (err: any) {
      setRestoreError(err.message || '백업 파일 복원에 실패했습니다.')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Reset to Sample Books
  const handleResetSample = () => {
    if (
      window.confirm(
        '서재를 풍성한 한국어 샘플 도서(수학/공학/인문학 및 AI 토론 예시)로 초기화하시겠습니까?'
      )
    ) {
      onRestoreBackup(SAMPLE_BOOKS, settings)
      setRestoreMessage('샘플 도서 3권 및 독서 일지/수식 노트로 초기화되었습니다.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-secondary)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--text-primary)]">
                서재 환경설정 & Google Drive 백업
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                AI 독서 토론 API 키, 테마, 목표, 구글 드라이브 백업을 관리합니다.
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <form id="settings-form" onSubmit={handleSave} className="space-y-6">
            
            {/* Section 1: AI API Key Configuration */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface-secondary)] border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs sm:text-sm text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI 심층 독서 토론 API 설정 (Gemini & OpenAI)</span>
                </h4>
                <span className="text-[11px] text-[var(--text-muted)]">클라이언트 로컬에만 안전하게 보관됨</span>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedAiProvider: 'gemini' })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.selectedAiProvider === 'gemini'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span>Google Gemini (권장)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedAiProvider: 'openai' })}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    formData.selectedAiProvider === 'openai'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span>OpenAI GPT-4o</span>
                </button>
              </div>

              {/* Gemini API Key */}
              {formData.selectedAiProvider === 'gemini' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Google Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>무료 API 키 발급받기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={formData.geminiApiKey}
                    onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)]">모델 선택:</span>
                    <select
                      value={formData.geminiModel}
                      onChange={(e) => setFormData({ ...formData, geminiModel: e.target.value })}
                      className="text-xs px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (초고속 & 수식 분석)</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (초고지능 심층 추론)</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </select>
                  </div>
                </div>
              )}

              {/* OpenAI API Key */}
              {formData.selectedAiProvider === 'openai' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-[var(--text-secondary)]">
                      OpenAI API Key
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>OpenAI 키 발급받기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={formData.openaiApiKey}
                    onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* Section 2: User Profile & Goals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  독서가 닉네임
                </label>
                <input
                  type="text"
                  value={formData.userNickname}
                  onChange={(e) => setFormData({ ...formData, userNickname: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  2026년 독서 목표 (권)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={formData.annualGoal}
                  onChange={(e) => setFormData({ ...formData, annualGoal: parseInt(e.target.value) || 24 })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Section 3: Theme Selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
                서재 비주얼 테마
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: 'wood' })}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    formData.theme === 'wood'
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-[#faf7f2]'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#5c3a21] border border-[#d97706]" />
                  <div>
                    <span className="text-xs font-bold text-[#2d241e] block">클래식 우드 서재</span>
                    <span className="text-[10px] text-[#63584e]">따뜻한 원목 책장 & 크림 페이퍼</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, theme: 'midnight' })}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    formData.theme === 'midnight'
                      ? 'border-amber-500 ring-2 ring-amber-500/20 bg-[#0f172a]'
                      : 'border-[var(--border-color)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#090d16] border border-[#f59e0b]" />
                  <div>
                    <span className="text-xs font-bold text-[#f8fafc] block">미드나잇 다크</span>
                    <span className="text-[10px] text-[#94a3b8]">세련된 다크 글래스모피즘</span>
                  </div>
                </button>
              </div>
            </div>

          </form>

          {/* =========================================================================
              SECTION 4: GOOGLE DRIVE BACKUP & RESTORE (REQUIREMENT 8)
              ========================================================================= */}
          <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-color)] space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                  Google Drive 백업 및 복원 (Cloud Sync & Restore)
                </h4>
                <p className="text-[11px] text-[var(--text-muted)]">
                  독서 기록, 서평, 밑줄 문장, AI 토론 요약본을 구글 드라이브에 안전하게 보관하세요.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportGoogleDrive}
                className="py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Google Drive 백업 파일 다운로드</span>
              </button>

              {/* Restore Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-amber-500/50 text-[var(--text-primary)] font-medium text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4 text-amber-600" />
                <span>드라이브에서 백업 파일 복원</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Restore Notification Messages */}
            {restoreMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{restoreMessage}</span>
              </div>
            )}
            {restoreError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{restoreError}</span>
              </div>
            )}

            {/* Reset Sample Button */}
            <div className="pt-2 border-t border-[var(--border-color)] flex justify-end">
              <button
                type="button"
                onClick={handleResetSample}
                className="text-[11px] text-[var(--text-muted)] hover:text-amber-600 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>샘플 데이터셋 다시 불러오기</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-surface-secondary)]">
          <span className="text-xs text-[var(--text-muted)]">
            {isSaved && <span className="text-emerald-600 font-semibold">설정이 저장되었습니다! ✓</span>}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
            >
              닫기
            </button>
            <button
              type="submit"
              form="settings-form"
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all active:scale-95"
            >
              설정 저장
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
