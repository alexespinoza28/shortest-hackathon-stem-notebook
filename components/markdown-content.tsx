"use client"

import { BlockMath } from "react-katex"
import "katex/dist/katex.min.css"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  // Simple approach: Split into lines and render each appropriately
  const renderContent = () => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]

      // Skip empty lines
      if (!line.trim()) {
        elements.push(<br key={key++} />)
        continue
      }

      // Check if this line contains LaTeX (has backslash commands)
      const hasLatex = /\\[a-zA-Z]+/.test(line)

      if (hasLatex) {
        // This is a LaTeX line - clean it up and render as display math
        // Remove all $ signs
        let cleaned = line.replace(/\$/g, '')

        // Fix malformed \frac{num}denom -> \frac{num}{denom}
        cleaned = cleaned.replace(/\\frac\{([^}]+)\}([a-zA-Z0-9]+)/g, (match, num, denom) => {
          return `\\frac{${num}}{${denom}}`
        })

        // Try to render with KaTeX
        try {
          elements.push(
            <div key={key++} className="my-2">
              <BlockMath math={cleaned.trim()} />
            </div>
          )
        } catch (e) {
          // If KaTeX fails, show as text
          elements.push(
            <div key={key++} className="text-sm text-muted-foreground my-1">
              {line}
            </div>
          )
        }
      } else {
        // Regular text line - apply basic markdown formatting
        let formatted = line
        // Bold
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        // Italic
        formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
        // Code
        formatted = formatted.replace(/`(.+?)`/g, "<code class='bg-muted px-1 py-0.5 rounded text-sm font-mono'>$1</code>")

        elements.push(
          <div
            key={key++}
            className="text-sm my-1"
            dangerouslySetInnerHTML={{ __html: formatted }}
          />
        )
      }
    }

    return elements
  }

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {renderContent()}
    </div>
  )
}
