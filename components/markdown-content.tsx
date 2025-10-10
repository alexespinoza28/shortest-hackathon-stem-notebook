"use client"

import { InlineMath, BlockMath } from "react-katex"
import "katex/dist/katex.min.css"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {

  // Parse content into text and LaTeX segments
  const parseContent = (text: string): React.ReactNode[] => {
    const segments: React.ReactNode[] = []
    let currentIndex = 0
    let key = 0

    // Auto-wrap LaTeX commands that aren't already in $ delimiters
    const wrapLatexCommands = (str: string): string => {
      const replacements: { start: number; end: number; text: string }[] = []

      // Pattern 1: Commands with braces like \frac{a}{b}, \boxed{...}
      const bracesRegex = /(\\[a-zA-Z]+)\{/g
      let match

      while ((match = bracesRegex.exec(str)) !== null) {
        const startPos = match.index
        const cmdEndPos = startPos + match[0].length

        if (startPos > 0 && str[startPos - 1] === '$') continue

        let depth = 1
        let endPos = cmdEndPos
        while (depth > 0 && endPos < str.length) {
          if (str[endPos] === '{') depth++
          if (str[endPos] === '}') depth--
          endPos++
        }

        if (endPos < str.length && str[endPos] === '$') continue

        const fullCommand = str.substring(startPos, endPos)
        replacements.push({ start: startPos, end: endPos, text: `$${fullCommand}$` })
      }

      // Pattern 2: Standalone backslash commands
      const standaloneRegex = /\\[a-zA-Z]+/g
      while ((match = standaloneRegex.exec(str)) !== null) {
        const startPos = match.index
        const endPos = startPos + match[0].length

        if (startPos > 0 && str[startPos - 1] === '$') continue
        if (endPos < str.length && str[endPos] === '$') continue

        const overlaps = replacements.some(r => startPos >= r.start && endPos <= r.end)
        if (overlaps) continue

        replacements.push({ start: startPos, end: endPos, text: `$${match[0]}$` })
      }

      replacements.sort((a, b) => b.start - a.start)
      let result = str
      for (const { start, end, text } of replacements) {
        result = result.substring(0, start) + text + result.substring(end)
      }
      return result
    }

    text = wrapLatexCommands(text)

    // Match display math $$ ... $$ and inline math $ ... $
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g
    let match

    while ((match = regex.exec(text)) !== null) {
      // Add text before the math
      if (match.index > currentIndex) {
        const textSegment = text.substring(currentIndex, match.index)
        segments.push(
          <span key={key++} dangerouslySetInnerHTML={{ __html: formatText(textSegment) }} />
        )
      }

      // Add the math
      const latex = match[0]
      if (latex.startsWith('$$')) {
        const equation = latex.slice(2, -2)
        segments.push(<BlockMath key={key++} math={equation} />)
      } else {
        const equation = latex.slice(1, -1)
        segments.push(<InlineMath key={key++} math={equation} />)
      }

      currentIndex = match.index + match[0].length
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const textSegment = text.substring(currentIndex)
      segments.push(
        <span key={key++} dangerouslySetInnerHTML={{ __html: formatText(textSegment) }} />
      )
    }

    return segments
  }

  // Format plain text with basic markdown
  const formatText = (text: string): string => {
    let formatted = text
    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Inline code
    formatted = formatted.replace(/`(.+?)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm font-mono'>$1</code>")
    // Line breaks
    formatted = formatted.replace(/\n/g, "<br />")
    return formatted
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
      {parseContent(content)}
    </div>
  )
}
