import React, { useMemo } from 'react'
import katex from 'katex'

interface LatexRendererProps {
  content: string
  className?: string
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return ''

    // Split text into tokens: block math ($$...$$), inline math ($...$), and regular text/markdown
    const tokens: Array<{ type: 'text' | 'inline-math' | 'block-math'; raw: string }> = []
    
    let remaining = content

    while (remaining.length > 0) {
      // Check for block math $$...$$
      const blockMatch = remaining.match(/^(\$\$[\s\S]*?\$\$)/)
      if (blockMatch) {
        tokens.push({ type: 'block-math', raw: blockMatch[1].slice(2, -2).trim() })
        remaining = remaining.slice(blockMatch[0].length)
        continue
      }

      // Check for inline math $...$ (avoid matching escaped \$ or currency like $100 without matching $)
      const inlineMatch = remaining.match(/^(\$([^\$\n\r]+?)\$)/)
      if (inlineMatch) {
        tokens.push({ type: 'inline-math', raw: inlineMatch[2].trim() })
        remaining = remaining.slice(inlineMatch[0].length)
        continue
      }

      // Find the next occurrence of $
      const nextDollar = remaining.indexOf('$')
      if (nextDollar === -1) {
        tokens.push({ type: 'text', raw: remaining })
        break
      } else if (nextDollar === 0) {
        // Stray $ or edge case
        tokens.push({ type: 'text', raw: remaining.slice(0, 1) })
        remaining = remaining.slice(1)
      } else {
        tokens.push({ type: 'text', raw: remaining.slice(0, nextDollar) })
        remaining = remaining.slice(nextDollar)
      }
    }

    // Convert tokens to HTML
    return tokens
      .map(token => {
        if (token.type === 'block-math') {
          try {
            const html = katex.renderToString(token.raw, {
              displayMode: true,
              throwOnError: false,
              output: 'htmlAndMathml'
            })
            return `<div class="latex-block my-2 overflow-x-auto">${html}</div>`
          } catch (e) {
            return `<pre class="text-red-500 font-mono text-xs">$$${token.raw}$$</pre>`
          }
        }

        if (token.type === 'inline-math') {
          try {
            const html = katex.renderToString(token.raw, {
              displayMode: false,
              throwOnError: false,
              output: 'htmlAndMathml'
            })
            return `<span class="latex-inline inline-block mx-0.5">${html}</span>`
          } catch (e) {
            return `<code class="text-red-500 font-mono text-xs">$${token.raw}$</code>`
          }
        }

        // Process basic markdown formatting in text
        let text = token.raw
          // Escape HTML
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          // Bold
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          // Italic
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          // Code
          .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-sm font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300">$1</code>')
          // Newlines
          .replace(/\n/g, '<br/>')

        return text
      })
      .join('')
  }, [content])

  return (
    <div
      className={`latex-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  )
}
