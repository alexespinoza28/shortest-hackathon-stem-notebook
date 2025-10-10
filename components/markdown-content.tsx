"use client"

import { useEffect, useRef } from "react"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && typeof window !== "undefined" && (window as any).MathJax) {
      // Add a small delay to let the DOM settle before typesetting
      const timer = setTimeout(() => {
        if (contentRef.current) {
          ;(window as any).MathJax.typesetPromise([contentRef.current])
            .then(() => {
              console.log("MathJax typeset complete")
            })
            .catch((err: any) => {
              console.error("MathJax error:", err)
            })
        }
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [content])

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    // Protect LaTeX equations from other replacements
    const latexPlaceholders: string[] = []

    // Auto-wrap LaTeX commands that aren't already in $ delimiters
    const wrapLatexCommands = (str: string): string => {
      const replacements: { start: number; end: number; text: string }[] = []

      // Pattern 1: Commands with braces like \frac{a}{b}, \boxed{...}
      const bracesRegex = /(\\[a-zA-Z]+)\{/g
      let match

      while ((match = bracesRegex.exec(str)) !== null) {
        const startPos = match.index
        const cmdEndPos = startPos + match[0].length

        // Check if already wrapped with $
        if (startPos > 0 && str[startPos - 1] === '$') {
          continue
        }

        // Find matching closing brace
        let depth = 1
        let endPos = cmdEndPos

        while (depth > 0 && endPos < str.length) {
          if (str[endPos] === '{') depth++
          if (str[endPos] === '}') depth--
          endPos++
        }

        // Check if followed by $
        if (endPos < str.length && str[endPos] === '$') {
          continue
        }

        // Store replacement
        const fullCommand = str.substring(startPos, endPos)
        replacements.push({
          start: startPos,
          end: endPos,
          text: `$${fullCommand}$`,
        })
      }

      // Pattern 2: Standalone backslash commands like \alpha, \pi, \infty, etc.
      const standaloneRegex = /\\[a-zA-Z]+/g
      while ((match = standaloneRegex.exec(str)) !== null) {
        const startPos = match.index
        const endPos = startPos + match[0].length

        // Check if already wrapped or part of another replacement
        if (startPos > 0 && str[startPos - 1] === '$') {
          continue
        }
        if (endPos < str.length && str[endPos] === '$') {
          continue
        }

        // Check if this is already part of a braces pattern we found
        const overlaps = replacements.some(r => startPos >= r.start && endPos <= r.end)
        if (overlaps) {
          continue
        }

        replacements.push({
          start: startPos,
          end: endPos,
          text: `$${match[0]}$`,
        })
      }

      // Pattern 3: Superscripts and subscripts like x^2, x_1, x^{10}
      const scriptRegex = /([a-zA-Z0-9])([\^_])(\{[^}]+\}|[a-zA-Z0-9])/g
      while ((match = scriptRegex.exec(str)) !== null) {
        const startPos = match.index
        const endPos = startPos + match[0].length

        // Check if already wrapped
        if (startPos > 0 && str[startPos - 1] === '$') {
          continue
        }
        if (endPos < str.length && str[endPos] === '$') {
          continue
        }

        // Check if overlaps with existing replacements
        const overlaps = replacements.some(r =>
          (startPos >= r.start && startPos < r.end) ||
          (endPos > r.start && endPos <= r.end)
        )
        if (overlaps) {
          continue
        }

        replacements.push({
          start: startPos,
          end: endPos,
          text: `$${match[0]}$`,
        })
      }

      // Apply replacements in reverse order to maintain positions
      replacements.sort((a, b) => b.start - a.start)
      let result = str
      for (const { start, end, text } of replacements) {
        result = result.substring(0, start) + text + result.substring(end)
      }

      return result
    }

    text = wrapLatexCommands(text)

    // Store display math $$ ... $$
    text = text.replace(/\$\$(.+?)\$\$/gs, (match, equation) => {
      const placeholder = `__LATEX_DISPLAY_${latexPlaceholders.length}__`
      latexPlaceholders.push(`$$${equation}$$`)
      return placeholder
    })

    // Store inline math $ ... $ (keep original $ delimiters)
    text = text.replace(/\$(.+?)\$/g, (match, equation) => {
      const placeholder = `__LATEX_INLINE_${latexPlaceholders.length}__`
      latexPlaceholders.push(`$${equation}$`)
      return placeholder
    })

    // Convert **bold** to <strong> (but not inside code blocks)
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    // Convert *italic* to <em> (but be careful with * in equations)
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")

    // Convert inline code `code` to <code>
    text = text.replace(/`(.+?)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm'>$1</code>")

    // Convert line breaks
    text = text.replace(/\n/g, "<br />")

    // Restore LaTeX equations (all use original delimiters now)
    latexPlaceholders.forEach((latex, index) => {
      if (latex.startsWith('$$')) {
        text = text.replace(`__LATEX_DISPLAY_${index}__`, latex)
      } else {
        text = text.replace(`__LATEX_INLINE_${index}__`, latex)
      }
    })

    return text
  }

  return (
    <div
      ref={contentRef}
      className="prose prose-sm dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  )
}
