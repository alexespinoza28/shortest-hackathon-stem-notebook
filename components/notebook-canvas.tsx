"use client"

import { useState, useEffect } from "react"
import { AiSidebar } from "./ai-sidebar"
import { NotebookToolbar } from "./notebook-toolbar-inline"
import { EquationBlock } from "./blocks/equation-block"
import { TextBlock } from "./blocks/text-block"
import { TodoBlock } from "./blocks/todo-block"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NvidiaLogo } from "./nvidia-logo"
import { updateNotebook } from "@/lib/notebook-utils"

interface TodoItem {
  id: string
  text: string
  checked: boolean
}

interface Block {
  id: string
  type: "equation" | "text" | "todo"
  content?: string
  items?: TodoItem[]
  position: { x: number; y: number }
  scale: number
}

interface NotebookCanvasProps {
  notebookId?: string
}

export function NotebookCanvas({ notebookId = "default-notebook" }: NotebookCanvasProps = {}) {
  const [aiOpen, setAiOpen] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load blocks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`notebook-${notebookId}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setBlocks(parsed)
      } catch (e) {
        console.error("Failed to load notebook:", e)
      }
    }
    // Mark as loaded after attempting to load
    setIsLoaded(true)
  }, [notebookId])

  // Auto-save blocks to localStorage whenever they change (but only after initial load)
  useEffect(() => {
    if (!isLoaded) return // Don't save until we've loaded

    localStorage.setItem(`notebook-${notebookId}`, JSON.stringify(blocks))
    console.log(`Saved ${blocks.length} blocks to notebook-${notebookId}`)

    // Update notebook metadata timestamp
    updateNotebook(notebookId, { updatedAt: Date.now() })
  }, [blocks, notebookId, isLoaded])

  const handleInsert = (type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: type as "equation" | "text" | "todo",
      content: type !== "todo" ? "" : undefined,
      items: type === "todo" ? [{ id: "1", text: "", checked: false }] : undefined,
      position: { x: 100, y: 100 + blocks.length * 150 },
      scale: 1,
    }
    setBlocks([...blocks, newBlock])
  }

  const handleBlockUpdate = (id: string, content: string | TodoItem[]) => {
    setBlocks(
      blocks.map((block) => {
        if (block.id === id) {
          if (typeof content === "string") {
            return { ...block, content }
          } else {
            return { ...block, items: content }
          }
        }
        return block
      })
    )
  }

  const handleBlockDelete = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const handleBlockMove = (id: string, position: { x: number; y: number }) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, position } : block)))
  }

  const handleBlockScale = (id: string, scale: number) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, scale } : block)))
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-semibold text-primary hover:underline tracking-tight" style={{ fontFamily: 'var(--font-gothic-a1)' }}>
              Nemo Pad
            </a>
            <NotebookToolbar onInsert={handleInsert} />
          </div>
          <Button
            variant={aiOpen ? "default" : "outline"}
            size="default"
            onClick={() => setAiOpen(!aiOpen)}
            className="gap-3 px-4 py-2"
          >
            <NvidiaLogo className="w-6 h-6" />
            <span className="font-medium">Nemotron Assistant</span>
          </Button>
        </div>

        {/* Paper Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-background">
          <div className="w-full min-h-full">
            <div
              className="bg-card border-2 border-primary rounded-lg shadow-lg min-h-[2000px] relative pb-20"
              onDoubleClick={(e) => {
                if (e.target === e.currentTarget) {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const newBlock: Block = {
                    id: `block-${Date.now()}`,
                    type: "equation",
                    content: "",
                    position: { x, y },
                    scale: 1,
                  }
                  setBlocks([...blocks, newBlock])
                }
              }}
            >
              {/* Notebook line paper background */}
              <div
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{
                  backgroundImage: `
                    linear-gradient(transparent 0px, transparent 39px, oklch(0.70 0.21 135 / 0.2) 39px, oklch(0.70 0.21 135 / 0.2) 40px),
                    linear-gradient(90deg, oklch(0.40 0.05 150 / 0.15) 0px, oklch(0.40 0.05 150 / 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: "100% 40px, 100% 100%",
                  backgroundPosition: "0 0, 60px 0",
                }}
              />

              {/* Placeholder when no blocks */}
              {blocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-lg">
                    Click the equation button above to add your first equation block
                  </p>
                </div>
              )}

              {/* Render blocks */}
              {blocks.map((block) => {
                if (block.type === "equation") {
                  return (
                    <EquationBlock
                      key={block.id}
                      id={block.id}
                      initialContent={block.content || ""}
                      position={block.position}
                      scale={block.scale}
                      onUpdate={handleBlockUpdate}
                      onDelete={handleBlockDelete}
                      onMove={handleBlockMove}
                      onScale={handleBlockScale}
                    />
                  )
                } else if (block.type === "text") {
                  return (
                    <TextBlock
                      key={block.id}
                      id={block.id}
                      initialContent={block.content || ""}
                      position={block.position}
                      scale={block.scale}
                      onUpdate={handleBlockUpdate}
                      onDelete={handleBlockDelete}
                      onMove={handleBlockMove}
                      onScale={handleBlockScale}
                    />
                  )
                } else if (block.type === "todo") {
                  return (
                    <TodoBlock
                      key={block.id}
                      id={block.id}
                      initialItems={block.items || []}
                      position={block.position}
                      scale={block.scale}
                      onUpdate={handleBlockUpdate}
                      onDelete={handleBlockDelete}
                      onMove={handleBlockMove}
                      onScale={handleBlockScale}
                    />
                  )
                }
                return null
              })}
            </div>
          </div>
        </div>
      </div>

      <AiSidebar isOpen={aiOpen} onClose={() => setAiOpen(false)} blocks={blocks} />
    </div>
  )
}
