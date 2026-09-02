import React from 'react'
import { Sparkles, FunctionSquare, Plus } from 'lucide-react'

interface MathToolbarProps {
  onInsert: (latexSnippet: string) => void
}

const COMMON_FORMULAS = [
  { label: '분수 (Fraction)', code: '\\frac{dy}{dx}' },
  { label: '편미분 (Partial)', code: '\\frac{\\partial f}{\\partial x}' },
  { label: '정적분 (Def Integral)', code: '\\int_{a}^{b} f(x) dx' },
  { label: '무한적분 (Inf Integral)', code: '\\int_{0}^{\\infty} e^{-x^2} dx' },
  { label: '시그마 합 (Sum)', code: '\\sum_{i=1}^{n} a_i' },
  { label: '극한 (Limit)', code: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
  { label: '델/회전 (Curl/Div)', code: '\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}' },
  { label: '행렬 2x2 (Matrix)', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: '근의 공식 (Quadratic)', code: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
  { label: '지수/로그', code: 'e^{i\\pi} + 1 = 0' }
]

export const MathToolbar: React.FC<MathToolbarProps> = ({ onInsert }) => {
  return (
    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
      <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
        <span className="font-bold flex items-center gap-1">
          <FunctionSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>수학/공학 LaTeX 수식 도우미 (클릭 시 자동 삽입)</span>
        </span>
        <span className="text-[10px] opacity-75">인라인: $...$ / 블록: $$...$$</span>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {COMMON_FORMULAS.map((formula, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onInsert(`$${formula.code}$`)}
            className="px-2 py-1 rounded-md bg-[var(--bg-surface)] hover:bg-amber-500/20 border border-[var(--border-color)] text-[11px] font-mono text-[var(--text-primary)] hover:text-amber-600 transition-all shadow-xs flex items-center gap-1"
            title={`클릭하여 ${formula.label} 수식 삽입`}
          >
            <Plus className="w-2.5 h-2.5 opacity-60" />
            <span>{formula.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
