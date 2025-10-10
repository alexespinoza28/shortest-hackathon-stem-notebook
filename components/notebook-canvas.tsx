"use client"

import { useState, useRef } from "react"
import { AiSidebar } from "./ai-sidebar"
import { NotebookToolbar } from "./notebook-toolbar-inline"
import { EquationBlock } from "./equation-block"
import { Sparkles, X, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type BlockType = "text" | "equation" | "code" | "heading"

interface Block {
  id: string
  type: BlockType
  content: string
  x: number
  y: number
  isConverting?: boolean
}

export function NotebookCanvas() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [aiOpen, setAiOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const createBlock = (type: BlockType, x: number, y: number) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(7),
      type,
      content: getDefaultContent(type),
      x,
      y,
    }
    setBlocks([...blocks, newBlock])
    setSelectedBlock(newBlock.id)
  }

  const getDefaultContent = (type: BlockType): string => {
    switch (type) {
      case "equation":
        return "integral of x^2 from 0 to 100"
      case "code":
        return "# Your code here\nprint('Hello, World!')"
      case "heading":
        return "Heading"
      case "text":
      default:
        return "Start typing..."
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only create new block if clicking on the canvas itself, not on existing blocks
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      createBlock("text", x, y)
    }
  }

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)))
  }

  const convertToLatex = async (id: string) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return

    console.log("Converting:", block.content)

    // Mark as converting
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, isConverting: true } : b)))

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Convert this natural language math expression to LaTeX notation. Only output the LaTeX code with no additional text or explanation: "${block.content}"`
        }),
      })

      if (response.ok) {
        const data = await response.json()
        let latex = data.response.trim()

        console.log("Converted to:", latex)

        // Clean up the response - remove code blocks, backticks, and $$
        latex = latex
          .replace(/```latex\n?/g, "")
          .replace(/```\n?/g, "")
          .replace(/^\$+/g, "")
          .replace(/\$+$/g, "")
          .trim()

        setBlocks(blocks.map((b) => (b.id === id ? { ...b, content: latex, isConverting: false } : b)))
      } else {
        console.error("API error:", await response.text())
        setBlocks(blocks.map((b) => (b.id === id ? { ...b, isConverting: false } : b)))
      }
    } catch (error) {
      console.error("Failed to convert to LaTeX:", error)
      setBlocks(blocks.map((b) => (b.id === id ? { ...b, isConverting: false } : b)))
    }
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
    if (selectedBlock === id) {
      setSelectedBlock(null)
    }
  }

  const handleInsert = (type: BlockType) => {
    // Insert new block in the center of the visible area
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      createBlock(type, rect.width / 2 - 100, rect.height / 2 - 50)
    }
  }

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    if ((e.target as HTMLElement).tagName === "TEXTAREA" || (e.target as HTMLElement).tagName === "INPUT") {
      return // Don't drag when interacting with inputs
    }

    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    setDraggingBlock(blockId)
    setSelectedBlock(blockId)
    setDragOffset({
      x: e.clientX - block.x,
      y: e.clientY - block.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingBlock || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left - dragOffset.x
    const newY = e.clientY - rect.top - dragOffset.y

    setBlocks(blocks.map((block) =>
      block.id === draggingBlock
        ? { ...block, x: Math.max(0, newX), y: Math.max(0, newY) }
        : block
    ))
  }

  const handleMouseUp = () => {
    setDraggingBlock(null)
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
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative bg-card border-2 border-primary rounded-lg shadow-lg min-h-[calc(100vh-200px)] cursor-crosshair"
            style={{ minHeight: "2000px", minWidth: "100%" }}
          >
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

            {/* Render blocks */}
            {blocks.map((block) => (
              <div
                key={block.id}
                className={`absolute group ${selectedBlock === block.id ? "ring-2 ring-primary" : ""} ${draggingBlock === block.id ? "cursor-grabbing" : "cursor-grab"}`}
                style={{ left: block.x, top: block.y }}
                onMouseDown={(e) => handleMouseDown(e, block.id)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedBlock(block.id)
                }}
              >
                <div className="relative bg-background/80 backdrop-blur-sm rounded-lg shadow-md p-3 min-w-[200px] max-w-[600px]">
                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBlock(block.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* Block type indicator */}
                  <div className="text-xs text-muted-foreground mb-1 font-mono flex items-center gap-2">
                    <span>{block.type}</span>
                    {block.isConverting && <span className="text-primary animate-pulse">Converting...</span>}
                  </div>

                  {/* Content based on type */}
                  {block.type === "equation" ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <div className="mb-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => convertToLatex(block.id)}
                          disabled={block.isConverting}
                          className="w-full gap-2"
                        >
                          <Wand2 className="w-3 h-3" />
                          {block.isConverting ? "Converting..." : "Convert to LaTeX"}
                        </Button>
                      </div>
                      <EquationBlock content={block.content} onUpdate={(content) => updateBlockContent(block.id, content)} />
                    </div>
                  ) : block.type === "code" ? (
                    <div className="border border-border rounded p-2 bg-card">
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm"
                        rows={5}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : block.type === "heading" ? (
                    <input
                      type="text"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-2xl font-bold"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <textarea
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      className="w-full bg-transparent border-none outline-none resize-none text-sm"
                      rows={3}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>
            ))}

            {/* Placeholder text when no blocks */}
            {blocks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground text-lg">Click anywhere to add a note</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AiSidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  )
}
