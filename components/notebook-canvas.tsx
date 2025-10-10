"use client"

import type React from "react"

import { useState } from "react"
import { NotebookBlock } from "./notebook-block"
import { NotebookToolbar } from "./notebook-toolbar"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export type BlockType = "text" | "equation" | "code" | "graph" | "ai"

export interface Block {
  id: string
  type: BlockType
  content: string
  order: number
}

export function NotebookCanvas() {
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "1",
      type: "text",
      content: "# Welcome to STEM Notebook\n\nStart writing your notes, equations, and code here.",
      order: 0,
    },
  ])
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null)

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: "",
      order: blocks.length,
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const handleDragStart = (id: string) => {
    setDraggedBlock(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedBlock || draggedBlock === targetId) return

    const draggedIndex = blocks.findIndex((b) => b.id === draggedBlock)
    const targetIndex = blocks.findIndex((b) => b.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newBlocks = [...blocks]
    const [removed] = newBlocks.splice(draggedIndex, 1)
    newBlocks.splice(targetIndex, 0, removed)

    // Update order
    newBlocks.forEach((block, index) => {
      block.order = index
    })

    setBlocks(newBlocks)
  }

  const handleDragEnd = () => {
    setDraggedBlock(null)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Toolbar */}
      <NotebookToolbar onAddBlock={addBlock} />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif font-bold text-primary mb-2">STEM Notebook</h1>
            <p className="text-muted-foreground">
              Your digital paper for mathematics, code, and scientific exploration
            </p>
          </div>

          {/* Paper-like container */}
          <div className="bg-card border-2 border-primary rounded-lg shadow-lg min-h-[600px] p-8">
            <div className="space-y-4">
              {blocks
                .sort((a, b) => a.order - b.order)
                .map((block) => (
                  <NotebookBlock
                    key={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onDelete={deleteBlock}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedBlock === block.id}
                  />
                ))}

              {/* Add block button */}
              <Button
                variant="outline"
                className="w-full border-dashed border-2 hover:border-primary hover:bg-muted bg-transparent"
                onClick={() => addBlock("text")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Block
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
