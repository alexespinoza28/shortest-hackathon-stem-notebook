"use client"

import type React from "react"

import { useState } from "react"
import { GripVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { Block } from "./notebook-canvas"
import { cn } from "@/lib/utils"
import { AIBlock } from "./ai-block"
import { EquationBlock } from "./equation-block"
import { CodeBlock } from "./code-block"
import { GraphBlock } from "./graph-block"

interface NotebookBlockProps {
  block: Block
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onDragStart: (id: string) => void
  onDragOver: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  isDragging: boolean
}

export function NotebookBlock({
  block,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: NotebookBlockProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getBlockPlaceholder = () => {
    switch (block.type) {
      case "text":
        return "Start typing your notes..."
      case "equation":
        return "Enter LaTeX equation: \\frac{a}{b} = c"
      case "code":
        return '# Write your code here\nprint("Hello, World!")'
      case "graph":
        return "Enter graph data or function..."
      case "ai":
        return "Ask the AI assistant a question..."
      default:
        return "Enter content..."
    }
  }

  const getBlockLabel = () => {
    switch (block.type) {
      case "text":
        return "Text"
      case "equation":
        return "Equation"
      case "code":
        return "Code"
      case "graph":
        return "Graph"
      case "ai":
        return "AI Assistant"
      default:
        return "Block"
    }
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(block.id)}
      onDragOver={(e) => onDragOver(e, block.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative border-2 border-border rounded-lg p-4 bg-card transition-all",
        isDragging && "opacity-50",
        isHovered && "border-primary shadow-md",
      )}
    >
      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
          <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wide">
            {getBlockLabel()}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => onDelete(block.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Block content */}
      {block.type === "ai" ? (
        <AIBlock content={block.content} onUpdate={(content) => onUpdate(block.id, content)} />
      ) : block.type === "equation" ? (
        <EquationBlock content={block.content} onUpdate={(content) => onUpdate(block.id, content)} />
      ) : block.type === "code" ? (
        <CodeBlock content={block.content} onUpdate={(content) => onUpdate(block.id, content)} />
      ) : block.type === "graph" ? (
        <GraphBlock content={block.content} onUpdate={(content) => onUpdate(block.id, content)} />
      ) : (
        <Textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          placeholder={getBlockPlaceholder()}
          className={cn(
            "min-h-[100px] resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent",
            block.type === "code" && "font-mono text-sm",
          )}
        />
      )}
    </div>
  )
}
