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
      // First, fix malformed \frac commands that are missing braces around denominator
      // e.g., \frac{x^3}3 -> \frac{x^3}{3}
      str = str.replace(/\\frac\{([^}]+)\}([a-zA-Z0-9]+)/g, (match, numerator, denominator) => {
        return `\\frac{${numerator}}{${denominator}}`
      })

      // Convert slash fractions to \frac inside $ delimiters
      str = str.replace(/\$([^$]+)\$/g, (match, content) => {
        // Convert patterns like x^2 / 3 or x/100 to \frac{x^2}{3}
        // Also handle cases with subscripts: x_0^3 / 3
        const converted = content.replace(
          /([a-zA-Z0-9]+(?:[_\^][\{]?[a-zA-Z0-9]+[\}]?)*)\s*\/\s*([a-zA-Z0-9]+(?:[_\^][\{]?[a-zA-Z0-9]+[\}]?)*)/g,
          (m, numerator, denominator) => {
            return `\\frac{${numerator}}{${denominator}}`
          }
        )
        return `$${converted}$`
      })

      const replacements: { start: number; end: number; text: string }[] = []
      let match

      // Special pattern: \left[ ... \right]_a^b notation (evaluation brackets)
      const evalBracketRegex = /\\left\[[^\]]+\\right\][_^]?[\{]?[^\s$]+[\}]?[_^]?[\{]?[^\s$]*[\}]?/g
      while ((match = evalBracketRegex.exec(str)) !== null) {
        const startPos = match.index
        const endPos = startPos + match[0].length

        if (startPos > 0 && str[startPos - 1] === '$') continue
        if (endPos < str.length && str[endPos] === '$') continue

        replacements.push({ start: startPos, end: endPos, text: `$${match[0]}$` })
      }

      // Pattern 1: Commands with braces like \frac{a}{b}, \boxed{...}
      const bracesRegex = /(\\[a-zA-Z]+)\{/g

      while ((match = bracesRegex.exec(str)) !== null) {
        const startPos = match.index
        const cmdName = match[1]
        let endPos = startPos + match[0].length

        if (startPos > 0 && str[startPos - 1] === '$') continue

        // Check if this overlaps with evaluation bracket patterns
        const overlaps = replacements.some(r =>
          (startPos >= r.start && startPos < r.end) ||
          (endPos > r.start && endPos <= r.end)
        )
        if (overlaps) continue

        // Find matching closing brace for first argument
        let depth = 1
        while (depth > 0 && endPos < str.length) {
          if (str[endPos] === '{') depth++
          if (str[endPos] === '}') depth--
          endPos++
        }

        // Special handling for \frac - it has TWO brace groups {numerator}{denominator}
        if (cmdName === '\\frac' && endPos < str.length && str[endPos] === '{') {
          // Continue to capture the second brace group
          endPos++ // skip the opening {
          depth = 1
          while (depth > 0 && endPos < str.length) {
            if (str[endPos] === '{') depth++
            if (str[endPos] === '}') depth--
            endPos++
          }
        }

        if (endPos < str.length && str[endPos] === '$') continue

        const fullCommand = str.substring(startPos, endPos)
        replacements.push({ start: startPos, end: endPos, text: `$${fullCommand}$` })
      }

      // Pattern 2: Standalone backslash commands (including \left, \right without brackets)
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
