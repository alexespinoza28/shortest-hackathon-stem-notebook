"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface MarkdownContentProps {
  content: string
}

function LaTeXDisplay({ math }: { math: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false)

  useEffect(() => {
    // Poll for MathJax availability
    const checkMathJax = () => {
      if (typeof window !== "undefined" && (window as any).MathJax) {
        setMathJaxLoaded(true)
      } else {
        setTimeout(checkMathJax, 100)
      }
    }
    checkMathJax()
  }, [])

  useEffect(() => {
    if (!ref.current || !mathJaxLoaded) return

    try {
      // Use MathJax to render the LaTeX
      ref.current.innerHTML = `$$${math}$$`
      const MathJax = (window as any).MathJax
      if (MathJax?.typesetPromise) {
        MathJax.typesetPromise([ref.current]).catch((err: any) => {
          console.error("[v0] MathJax rendering error:", err)
          ref.current!.textContent = `$$${math}$$`
        })
      }
    } catch (e) {
      console.error("[v0] LaTeX display error:", e)
      ref.current.textContent = `$$${math}$$`
    }
  }, [math, mathJaxLoaded])

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
