"use client"

import { useState, useEffect } from "react"
import { AiSidebar } from "./ai-sidebar"
import { PagesSidebar } from "./pages-sidebar"
import { NotebookToolbar } from "./notebook-toolbar-inline"
import { EquationBlock } from "./blocks/equation-block"
import { TextBlock } from "./blocks/text-block"
import { TodoBlock } from "./blocks/todo-block"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NvidiaLogo } from "./nvidia-logo"
import {
  updateNotebook,
  getNotebookContent,
  savePageBlocks,
  createPage,
  deletePage,
  renamePage,
  type NotebookPage,
  type Block,
} from "@/lib/notebook-utils"

const NOTEBOOK_LINE_SPACING = 40
const NOTEBOOK_LINE_OFFSET = 39
const SNAP_THRESHOLD_PX = 8

interface TodoItem {
  id: string
  text: string
  checked: boolean
}

interface NotebookCanvasProps {
  notebookId?: string
}

export function NotebookCanvas({ notebookId = "default-notebook" }: NotebookCanvasProps) {
  const [aiOpen, setAiOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(true)
  const [blocks, setBlocks] = useState<Block[]>([])
  const [pages, setPages] = useState<NotebookPage[]>([])
  const [currentPageId, setCurrentPageId] = useState<string>("")
  const [isLoaded, setIsLoaded] = useState(false)
  const [snapToLines, setSnapToLines] = useState(true)
  const [snapGuideY, setSnapGuideY] = useState<number | null>(null)

  const computeSnap = (y: number) => {
    const snapped = Math.round((y - NOTEBOOK_LINE_OFFSET) / NOTEBOOK_LINE_SPACING) * NOTEBOOK_LINE_SPACING + NOTEBOOK_LINE_OFFSET
    const safeValue = Math.max(0, snapped)
    return {
      snappedY: safeValue,
      shouldSnap: Math.abs(safeValue - y) <= SNAP_THRESHOLD_PX,
    }
  }

  const forceSnap = (y: number) => {
    const snapped = Math.round((y - NOTEBOOK_LINE_OFFSET) / NOTEBOOK_LINE_SPACING) * NOTEBOOK_LINE_SPACING + NOTEBOOK_LINE_OFFSET
    return Math.max(0, snapped)
  }

  // Multi-select state
  const [selectedBlocks, setSelectedBlocks] = useState<Set<string>>(new Set())
  const [selectionBox, setSelectionBox] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)

  // Load pages from localStorage on mount
  useEffect(() => {
    const content = getNotebookContent(notebookId)
    if (content) {
      setPages(content.pages)
      setCurrentPageId(content.currentPageId)

      // Load blocks for current page
      const currentPage = content.pages.find((p) => p.id === content.currentPageId)
      if (currentPage) {
        setBlocks(currentPage.blocks)
      }
    }
    // Mark as loaded after attempting to load
    setIsLoaded(true)
  }, [notebookId])

  useEffect(() => {
    if (!snapToLines) {
      setSnapGuideY(null)
    }
  }, [snapToLines])

  useEffect(() => {
    const clearGuide = () => setSnapGuideY(null)
    window.addEventListener("mouseup", clearGuide)
    return () => window.removeEventListener("mouseup", clearGuide)
  }, [])

  // Auto-save blocks to current page whenever they change (but only after initial load)
  useEffect(() => {
    if (!isLoaded || !currentPageId) return // Don't save until we've loaded

    savePageBlocks(notebookId, currentPageId, blocks)
    console.log(`Saved ${blocks.length} blocks to page ${currentPageId}`)

    // Update local pages state
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === currentPageId ? { ...page, blocks } : page
      )
    )
  }, [blocks, notebookId, currentPageId, isLoaded])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in inputs
      const isTyping = document.activeElement?.tagName === 'INPUT' ||
                       document.activeElement?.tagName === 'TEXTAREA'

      // Ctrl/Cmd+A to select all blocks
      if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isTyping) {
        e.preventDefault()
        setSelectedBlocks(new Set(blocks.map(b => b.id)))
      }

      // Escape to deselect all
      if (e.key === 'Escape') {
        setSelectedBlocks(new Set())
      }

      // Delete key to delete selected blocks
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlocks.size > 0 && !isTyping) {
        e.preventDefault()
        setBlocks(blocks.filter(b => !selectedBlocks.has(b.id)))
        setSelectedBlocks(new Set())
      }

      // Ctrl/Cmd+] for next page
      if ((e.ctrlKey || e.metaKey) && e.key === ']' && !isTyping) {
        e.preventDefault()
        const currentIndex = pages.findIndex((p) => p.id === currentPageId)
        if (currentIndex < pages.length - 1) {
          handlePageSelect(pages[currentIndex + 1].id)
        }
      }

      // Ctrl/Cmd+[ for previous page
      if ((e.ctrlKey || e.metaKey) && e.key === '[' && !isTyping) {
        e.preventDefault()
        const currentIndex = pages.findIndex((p) => p.id === currentPageId)
        if (currentIndex > 0) {
          handlePageSelect(pages[currentIndex - 1].id)
        }
      }

      // Ctrl/Cmd+B to toggle pages sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !isTyping) {
        e.preventDefault()
        setPagesOpen(!pagesOpen)
      }

      // Ctrl/Cmd+Shift+N for new page
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N' && !isTyping) {
        e.preventDefault()
        handlePageCreate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [blocks, selectedBlocks, pages, currentPageId, pagesOpen])

  const handleInsert = (type: string) => {
    const basePosition = { x: 100, y: 100 + blocks.length * 150 }
    const targetPosition = snapToLines
      ? { ...basePosition, y: forceSnap(basePosition.y) }
      : basePosition

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: type as "equation" | "text" | "todo",
      content: type !== "todo" ? "" : undefined,
      items: type === "todo" ? [{ id: "1", text: "", checked: false }] : undefined,
      position: targetPosition,
      scale: 1,
      ...(type === "equation" ? { showEvaluation: false } : {}),
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

  const handleEvaluationToggle = (id: string, show: boolean) => {
    setBlocks(
      blocks.map((block) => (block.id === id ? { ...block, showEvaluation: show } : block))
    )
  }

  const handleBlockDelete = (id: string) => {
    setBlocks(blocks.filter((block) => block.id !== id))
  }

  const handleBlockMove = (id: string, newPosition: { x: number; y: number }) => {
    let targetPosition = newPosition

    if (snapToLines) {
      const snapInfo = computeSnap(newPosition.y)
      if (snapInfo.shouldSnap) {
        targetPosition = { ...newPosition, y: snapInfo.snappedY }
        setSnapGuideY(snapInfo.snappedY)
      } else {
        setSnapGuideY(null)
      }
    } else {
      setSnapGuideY(null)
    }

    // If the moved block is selected, move all selected blocks
    if (selectedBlocks.has(id)) {
      const movingBlock = blocks.find((b) => b.id === id)
      if (!movingBlock) return

      const dx = targetPosition.x - movingBlock.position.x
      const dy = targetPosition.y - movingBlock.position.y

      setBlocks(
        blocks.map((block) => {
          if (selectedBlocks.has(block.id)) {
            return {
              ...block,
              position: {
                x: block.position.x + dx,
                y: block.position.y + dy,
              },
            }
          }
          return block
        })
      )
    } else {
      // Move single block
      setBlocks(blocks.map((block) => (block.id === id ? { ...block, position: targetPosition } : block)))
    }
  }

  const handleBlockScale = (id: string, newScale: number) => {
    // If the scaled block is selected, scale all selected blocks
    if (selectedBlocks.has(id)) {
      const scalingBlock = blocks.find(b => b.id === id)
      if (!scalingBlock) return

      const scaleRatio = newScale / scalingBlock.scale

      setBlocks(blocks.map((block) => {
        if (selectedBlocks.has(block.id)) {
          return {
            ...block,
            scale: block.scale * scaleRatio,
          }
        }
        return block
      }))
    } else {
      // Scale single block
      setBlocks(blocks.map((block) => (block.id === id ? { ...block, scale: newScale } : block)))
    }
  }

  // Handle dragging selected blocks as a group
  const handleSelectionDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY

    // Store initial positions of all selected blocks
    const initialPositions = new Map(
      blocks.filter(b => selectedBlocks.has(b.id)).map(b => [b.id, { ...b.position }])
    )
    let anchorInitialY = Infinity
    initialPositions.forEach((pos) => {
      if (pos.y < anchorInitialY) {
        anchorInitialY = pos.y
      }
    })
    if (anchorInitialY === Infinity) {
      anchorInitialY = 0
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      let dyAdjusted = dy

      if (snapToLines) {
        const targetY = anchorInitialY + dy
        const snapInfo = computeSnap(targetY)
        if (snapInfo.shouldSnap) {
          dyAdjusted += snapInfo.snappedY - targetY
          setSnapGuideY(snapInfo.snappedY)
        } else {
          setSnapGuideY(null)
        }
      } else {
        setSnapGuideY(null)
      }

      setBlocks(prevBlocks =>
        prevBlocks.map(block => {
          if (selectedBlocks.has(block.id)) {
            const initial = initialPositions.get(block.id)
            if (initial) {
              return {
                ...block,
                position: {
                  x: initial.x + dx,
                  y: initial.y + dyAdjusted,
                },
              }
            }
          }
          return block
        })
      )
    }

    const handleMouseUp = () => {
      setSnapGuideY(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Handle resizing all selected blocks together
  const handleSelectionResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const startY = e.clientY

    // Store initial scales of all selected blocks
    const initialScales = new Map(
      blocks.filter(b => selectedBlocks.has(b.id)).map(b => [b.id, b.scale])
    )

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      // Calculate scale factor based on diagonal movement
      const distance = Math.sqrt(dx * dx + dy * dy)
      const direction = dx + dy > 0 ? 1 : -1
      const scaleFactor = 1 + (direction * distance) / 200

      setBlocks(prevBlocks =>
        prevBlocks.map(block => {
          if (selectedBlocks.has(block.id)) {
            const initialScale = initialScales.get(block.id) || 1
            return {
              ...block,
              scale: Math.max(0.5, Math.min(3, initialScale * scaleFactor)),
            }
          }
          return block
        })
      )
    }

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // Selection box handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only start selection if clicking directly on canvas (not on blocks)
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setIsSelecting(true)
      setSelectionBox({
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      })

      // Clear selection if not holding shift
      if (!e.shiftKey) {
        setSelectedBlocks(new Set())
      }
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSelecting && selectionBox) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setSelectionBox({
        ...selectionBox,
        currentX: x,
        currentY: y,
      })
    }
  }

  const handleCanvasMouseUp = () => {
    if (isSelecting && selectionBox) {
      // Calculate selection rectangle
      const minX = Math.min(selectionBox.startX, selectionBox.currentX)
      const maxX = Math.max(selectionBox.startX, selectionBox.currentX)
      const minY = Math.min(selectionBox.startY, selectionBox.currentY)
      const maxY = Math.max(selectionBox.startY, selectionBox.currentY)

      // Find blocks that intersect with selection box
      const newSelected = new Set(selectedBlocks)
      blocks.forEach((block) => {
        // Approximate block size (you can refine this based on actual block dimensions)
        const blockWidth = 200
        const blockHeight = 100

        const blockRight = block.position.x + blockWidth
        const blockBottom = block.position.y + blockHeight

        // Check if block intersects with selection box
        const intersects = !(
          block.position.x > maxX ||
          blockRight < minX ||
          block.position.y > maxY ||
          blockBottom < minY
        )

        if (intersects) {
          newSelected.add(block.id)
        }
      })

      setSelectedBlocks(newSelected)
      setIsSelecting(false)
      setSelectionBox(null)
    }
  }

  // Handle clicking on a block (for shift+click to toggle selection)
  const handleBlockClick = (id: string, e: React.MouseEvent) => {
    if (e.shiftKey) {
      e.preventDefault()
      e.stopPropagation()
      const newSelected = new Set(selectedBlocks)
      if (newSelected.has(id)) {
        newSelected.delete(id)
      } else {
        newSelected.add(id)
      }
      setSelectedBlocks(newSelected)
    } else {
      // Clear selection when clicking a single block
      setSelectedBlocks(new Set())
    }
  }

  // ===== PAGE MANAGEMENT HANDLERS =====

  const handlePageSelect = (pageId: string) => {
    if (pageId === currentPageId) return

    // Clear selection when switching pages
    setSelectedBlocks(new Set())

    // Load blocks for the selected page
    const page = pages.find((p) => p.id === pageId)
    if (page) {
      setBlocks(page.blocks)
      setCurrentPageId(pageId)

      // Update current page in storage
      const content = getNotebookContent(notebookId)
      if (content) {
        content.currentPageId = pageId
        localStorage.setItem(`notebook-${notebookId}`, JSON.stringify(content))
      }
    }
  }

  const handlePageCreate = () => {
    const newPage = createPage(notebookId)
    setPages([...pages, newPage])
    setCurrentPageId(newPage.id)
    setBlocks([])
    setSelectedBlocks(new Set())
  }

  const handlePageDelete = (pageId: string) => {
    const success = deletePage(notebookId, pageId)
    if (success) {
      // Reload pages from storage
      const content = getNotebookContent(notebookId)
      if (content) {
        setPages(content.pages)
        setCurrentPageId(content.currentPageId)

        // Load blocks for new current page
        const currentPage = content.pages.find((p) => p.id === content.currentPageId)
        if (currentPage) {
          setBlocks(currentPage.blocks)
        }
        setSelectedBlocks(new Set())
      }
    }
  }

  const handlePageRename = (pageId: string, newTitle: string) => {
    const success = renamePage(notebookId, pageId, newTitle)
    if (success) {
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === pageId ? { ...page, title: newTitle } : page
        )
      )
    }
  }

  const currentPage = pages.find((p) => p.id === currentPageId)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Pages Sidebar */}
      <PagesSidebar
        pages={pages}
        currentPageId={currentPageId}
        isOpen={pagesOpen}
        onToggle={() => setPagesOpen(!pagesOpen)}
        onPageSelect={handlePageSelect}
        onPageCreate={handlePageCreate}
        onPageDelete={handlePageDelete}
        onPageRename={handlePageRename}
      />

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Toolbar */}
        <div className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-2xl font-semibold text-primary hover:underline tracking-tight" style={{ fontFamily: 'var(--font-crimson-text)' }}>
              Nemo Pad
            </a>
            {currentPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>/</span>
                <span className="font-medium text-foreground">{currentPage.title}</span>
                <span className="text-xs">
                  (Page {pages.findIndex((p) => p.id === currentPageId) + 1} of {pages.length})
                </span>
              </div>
            )}
            <NotebookToolbar
              onInsert={handleInsert}
              snapToLines={snapToLines}
              onToggleSnap={() => setSnapToLines((prev) => !prev)}
            />
          </div>
          <Button
            variant={aiOpen ? "default" : "outline"}
            size="default"
            onClick={() => setAiOpen(!aiOpen)}
            className="gap-2 px-4 py-2"
          >
            <span className="font-medium">Nemotron Assistant</span>
          </Button>
        </div>

        {/* Paper Canvas */}
        <div className="flex-1 overflow-auto p-8 bg-background">
          <div className="w-full min-h-full">
            <div
              className="bg-card border-2 border-primary rounded-lg shadow-lg min-h-[2000px] relative pb-20"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onDoubleClick={(e) => {
                if (e.target === e.currentTarget) {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const targetPosition = snapToLines ? { x, y: forceSnap(y) } : { x, y }
                  const newBlock: Block = {
                    id: `block-${Date.now()}`,
                    type: "equation",
                    content: "",
                    position: targetPosition,
                    scale: 1,
                    showEvaluation: false,
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

              {snapToLines && snapGuideY !== null && (
                <div
                  className="absolute left-0 right-0 h-[2px] bg-primary/60 pointer-events-none z-40"
                  style={{ top: `${snapGuideY}px` }}
                />
              )}

              {/* Selection box */}
              {isSelecting && selectionBox && (
                <div
                  className="absolute border-2 border-primary bg-primary/10 pointer-events-none z-50"
                  style={{
                    left: Math.min(selectionBox.startX, selectionBox.currentX),
                    top: Math.min(selectionBox.startY, selectionBox.currentY),
                    width: Math.abs(selectionBox.currentX - selectionBox.startX),
                    height: Math.abs(selectionBox.currentY - selectionBox.startY),
                  }}
                />
              )}

              {/* Selection count indicator */}
              {selectedBlocks.size > 0 && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium z-50">
                  {selectedBlocks.size} block{selectedBlocks.size !== 1 ? 's' : ''} selected
                </div>
              )}

              {/* Placeholder when no blocks */}
              {blocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-lg">
                    Click the equation button above to add your first equation block
                  </p>
                </div>
              )}

              {/* Selection highlight box (single box around all selected blocks) */}
              {(() => {
                const selectedBlocksList = blocks.filter(b => selectedBlocks.has(b.id))
                if (selectedBlocksList.length === 0) return null

                // Calculate bounding box of all selected blocks
                const BLOCK_WIDTH = 300
                const BLOCK_HEIGHT = 150

                let minX = Infinity
                let minY = Infinity
                let maxX = -Infinity
                let maxY = -Infinity

                selectedBlocksList.forEach(block => {
                  const scaledWidth = BLOCK_WIDTH * block.scale
                  const scaledHeight = BLOCK_HEIGHT * block.scale

                  minX = Math.min(minX, block.position.x)
                  minY = Math.min(minY, block.position.y)
                  maxX = Math.max(maxX, block.position.x + scaledWidth)
                  maxY = Math.max(maxY, block.position.y + scaledHeight)
                })

                const bounds = {
                  x: minX - 8,
                  y: minY - 8,
                  width: maxX - minX + 16,
                  height: maxY - minY + 16,
                }

                return (
                  <div
                    key="selection-box"
                    className="absolute rounded-lg ring-4 ring-primary/50 bg-primary/5 cursor-move"
                    onMouseDown={handleSelectionDragStart}
                    style={{
                      left: bounds.x,
                      top: bounds.y,
                      width: bounds.width,
                      height: bounds.height,
                    }}
                  >
                    {/* Corner resize handles */}
                    <div
                      className="absolute bottom-0 right-0 w-4 h-4 bg-primary rounded-full cursor-se-resize hover:scale-125 transition-transform"
                      onMouseDown={handleSelectionResizeStart}
                      style={{
                        transform: 'translate(50%, 50%)',
                      }}
                    />
                    <div
                      className="absolute top-0 left-0 w-4 h-4 bg-primary rounded-full cursor-nw-resize hover:scale-125 transition-transform"
                      onMouseDown={handleSelectionResizeStart}
                      style={{
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full cursor-ne-resize hover:scale-125 transition-transform"
                      onMouseDown={handleSelectionResizeStart}
                      style={{
                        transform: 'translate(50%, -50%)',
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-4 h-4 bg-primary rounded-full cursor-sw-resize hover:scale-125 transition-transform"
                      onMouseDown={handleSelectionResizeStart}
                      style={{
                        transform: 'translate(-50%, 50%)',
                      }}
                    />
                  </div>
                )
              })()}

              {/* Render blocks */}
              {blocks.map((block) => {
                if (block.type === "equation") {
                  return (
                    <EquationBlock
                      key={block.id}
                      id={block.id}
                      initialContent={block.content || ""}
                      showEvaluation={Boolean(block.showEvaluation)}
                      position={block.position}
                      scale={block.scale}
                      onUpdate={handleBlockUpdate}
                      onDelete={handleBlockDelete}
                      onMove={handleBlockMove}
                      onScale={handleBlockScale}
                      onToggleEvaluation={handleEvaluationToggle}
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
