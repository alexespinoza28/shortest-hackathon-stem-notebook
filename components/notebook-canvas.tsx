"use client"

import { useState, useRef } from "react"
import { AiSidebar } from "./ai-sidebar"
import { NotebookToolbar } from "./notebook-toolbar-inline"
import { Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export type BlockType = "text" | "equation" | "code" | "heading"

interface Block {
  id: string
  type: BlockType
  content: string
  x: number
  y: number
}

export function NotebookCanvas() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [aiOpen, setAiOpen] = useState(false)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
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
        return "\\frac{a}{b} = c"
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
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
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
                className={`absolute group ${selectedBlock === block.id ? "ring-2 ring-primary" : ""}`}
                style={{ left: block.x, top: block.y }}
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
                  <div className="text-xs text-muted-foreground mb-1 font-mono">{block.type}</div>

                  {/* Content based on type */}
                  {block.type === "equation" ? (
                    <div className="border border-border rounded p-2 bg-card">
                      <div className="text-sm mb-1 text-muted-foreground">LaTeX:</div>
                      <textarea
                        value={block.content}
                        onChange={(e) => updateBlockContent(block.id, e.target.value)}
                        className="w-full bg-transparent border-none outline-none resize-none font-mono text-sm"
                        rows={3}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="mt-2 p-2 bg-muted rounded text-center">
                        <code>$$${block.content}$$$</code>
                      </div>
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
