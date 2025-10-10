"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface MarkdownContentProps {
  content: string
}

function LaTeXDisplay({ math }: { math: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Try to use KaTeX if available (works locally with npm package)
    if (typeof window !== "undefined" && (window as any).katex) {
      try {
        ;(window as any).katex.render(math, ref.current, {
          displayMode: true,
          throwOnError: false,
        })
      } catch (e) {
        ref.current.textContent = `$$${math}$$`
      }
    } else {
      // Fallback for v0 environment - show raw LaTeX
      ref.current.textContent = `$$${math}$$`
    }
  }, [math])

  return <div ref={ref} className="text-lg my-2" />
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const renderContent = () => {
    const lines = content.split("\n")
    const elements: React.ReactNode[] = []
    let key = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (!line.trim()) {
        elements.push(<br key={key++} />)
        continue
      }

      const hasLatex = /\\[a-zA-Z]+/.test(line)

      if (hasLatex) {
        let cleaned = line.replace(/\$/g, "")
        cleaned = cleaned.replace(/\\frac\{([^}]+)\}([a-zA-Z0-9]+)/g, (match, num, denom) => {
          return `\\frac{${num}}{${denom}}`
        })

        elements.push(<LaTeXDisplay key={key++} math={cleaned.trim()} />)
      } else {
        let formatted = line
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        formatted = formatted.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
        formatted = formatted.replace(
          /`(.+?)`/g,
          "<code class='bg-muted px-1 py-0.5 rounded text-sm font-mono'>$1</code>",
        )

        elements.push(<div key={key++} className="text-sm my-1" dangerouslySetInnerHTML={{ __html: formatted }} />)
      }
    }

    return elements
  }

  return <div className="prose prose-sm dark:prose-invert max-w-none">{renderContent()}</div>
}
