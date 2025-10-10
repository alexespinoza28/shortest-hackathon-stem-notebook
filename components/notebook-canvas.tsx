"use client"

import { useState, useRef } from "react"
import { AiSidebar } from "./ai-sidebar"
import { NotebookToolbar } from "./notebook-toolbar-inline"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotebookCanvas() {
  const [content, setContent] = useState("")
  const [aiOpen, setAiOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInsert = (type: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value

    let insertion = ""
    switch (type) {
      case "equation":
        insertion = "\n$$\n\\frac{a}{b} = c\n$$\n"
        break
      case "code":
        insertion = "\n```python\n# Your code here\nprint('Hello, World!')\n```\n"
        break
      case "heading":
        insertion = "\n## Heading\n"
        break
      default:
        return
    }

    const newText = text.substring(0, start) + insertion + text.substring(end)
    setContent(newText)

    // Focus and set cursor position
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + insertion.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-serif font-bold text-primary">STEM Notebook</h1>
            <NotebookToolbar onInsert={handleInsert} />
          </div>
          <Button
            variant={aiOpen ? "default" : "outline"}
            size="sm"
            onClick={() => setAiOpen(!aiOpen)}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
        </div>

        {/* Paper Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border-2 border-primary rounded-lg shadow-lg min-h-[calc(100vh-200px)] p-12 relative">
              {/* Grid paper background effect */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, oklch(0.28 0.08 260) 1px, transparent 1px),
                    linear-gradient(to bottom, oklch(0.28 0.08 260) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your notes here... Use the toolbar above to insert equations, code blocks, and more."
                className="w-full h-full min-h-[600px] bg-transparent border-none outline-none resize-none font-sans text-base leading-relaxed text-foreground placeholder:text-muted-foreground relative z-10"
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <AiSidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}
