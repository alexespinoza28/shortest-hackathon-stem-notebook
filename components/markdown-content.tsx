"use client"

import { useEffect, useRef } from "react"

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current && typeof window !== "undefined" && (window as any).MathJax) {
      // Typeset the math after content updates
      ;(window as any).MathJax.typesetPromise([contentRef.current]).catch((err: any) =>
        console.error("MathJax error:", err)
      )
    }
  }, [content])

  // Simple markdown parser for basic formatting
  const parseMarkdown = (text: string) => {
    // Protect LaTeX equations from other replacements
    const latexPlaceholders: string[] = []

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
