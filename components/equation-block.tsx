"use client"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

interface EquationBlockProps {
  content: string
  onUpdate: (content: string) => void
}

export function EquationBlock({ content, onUpdate }: EquationBlockProps) {
  const [latex, setLatex] = useState(content)
  const [showPreview, setShowPreview] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mathJaxLoaded, setMathJaxLoaded] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
    setLatex(content)
  }, [content])

  useEffect(() => {
    if (mathJaxLoaded && previewRef.current && showPreview) {
      try {
        const displayLatex = latex || "\\text{Enter LaTeX equation}"
        previewRef.current.innerHTML = `$$${displayLatex}$$`

        const MathJax = (window as any).MathJax
        if (MathJax && MathJax.typesetPromise) {
          MathJax.typesetPromise([previewRef.current]).catch((err: any) => {
            setError("Error rendering equation")
            console.error("[v0] MathJax error:", err)
          })
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid LaTeX")
      }
    }
  }, [latex, mathJaxLoaded, showPreview])

  const handleChange = (value: string) => {
    setLatex(value)
    onUpdate(value)
    setError(null)
  }

  return (
    <div className="space-y-3">
      {/* Toggle preview button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)} className="text-xs">
          {showPreview ? (
            <>
              <EyeOff className="w-3 h-3 mr-1" />
              Hide Preview
            </>
          ) : (
            <>
              <Eye className="w-3 h-3 mr-1" />
              Show Preview
            </>
          )}
        </Button>
      </div>

      {/* LaTeX input */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">LaTeX Input</label>
        <Textarea
          value={latex}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g., \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
          className="font-mono text-sm min-h-[80px] resize-y"
        />
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Preview</label>
          <div className="bg-muted/30 rounded-lg p-6 min-h-[100px] flex items-center justify-center overflow-x-auto">
            {!mathJaxLoaded ? (
              <div className="text-muted-foreground text-sm">Loading math renderer...</div>
            ) : (
              <div ref={previewRef} className="text-xl" />
            )}
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      )}

      {/* Quick reference */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">LaTeX Quick Reference</summary>
        <div className="mt-2 space-y-1 pl-4">
          <p>
            <code className="bg-muted px-1 rounded">
              \frac{"{a}"}
              {"{b}"}
            </code>{" "}
            - Fraction
          </p>
          <p>
            <code className="bg-muted px-1 rounded">\sqrt{"{x}"}</code> - Square root
          </p>
          <p>
            <code className="bg-muted px-1 rounded">x^{"{2}"}</code> - Superscript
          </p>
          <p>
            <code className="bg-muted px-1 rounded">x_{"{1}"}</code> - Subscript
          </p>
          <p>
            <code className="bg-muted px-1 rounded">
              \sum_{"{i=1}"}^{"{n}"}
            </code>{" "}
            - Summation
          </p>
          <p>
            <code className="bg-muted px-1 rounded">
              \int_{"{a}"}^{"{b}"}
            </code>{" "}
            - Integral
          </p>
        </div>
      </details>
    </div>
  )
}
