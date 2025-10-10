"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical, Trash2 } from "lucide-react"

interface TextBlockProps {
  id: string
  initialContent?: string
  position: { x: number; y: number }
  scale: number
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  onScale: (id: string, scale: number) => void
}

export function TextBlock({
  id,
  initialContent = "",
  position,
  scale,
  onUpdate,
  onDelete,
  onMove,
  onScale,
}: TextBlockProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(!initialContent)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; hasMoved: boolean } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startScale: number; startWidth: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: position.x,
      offsetY: position.y,
      hasMoved: false,
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return

      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > 3 && !dragRef.current.hasMoved) {
        dragRef.current.hasMoved = true
        setIsDragging(true)
      }

      if (dragRef.current.hasMoved) {
        onMove(id, {
          x: dragRef.current.offsetX + dx,
          y: dragRef.current.offsetY + dy,
        })
      }
    }

    const handleMouseUp = () => {
      if (dragRef.current && !dragRef.current.hasMoved && !isEditing) {
        setIsEditing(true)
      }

      setIsDragging(false)
      dragRef.current = null
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)

    const currentWidth = contentRef.current?.offsetWidth || 100
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScale: scale,
      startWidth: currentWidth * scale,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && resizeRef.current) {
        const dx = e.clientX - resizeRef.current.startX
        const currentWidth = contentRef.current?.offsetWidth || 100
        const newWidth = resizeRef.current.startWidth + dx
        const newScale = Math.max(0.5, Math.min(3, newWidth / currentWidth))
        onScale(id, newScale)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      resizeRef.current = null
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, id, onScale])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)
    onUpdate(id, newContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      if (!content.trim()) {
        onDelete(id)
      } else {
        setIsEditing(false)
      }
    }
  }

  const handleBlur = () => {
    console.log("Text block blur - content:", content, "trimmed:", content.trim())
    if (!content.trim()) {
      // Delete the block if empty
      console.log("Deleting empty text block:", id)
      onDelete(id)
      return
    }
    setIsEditing(false)
  }

  return (
    <div
      ref={blockRef}
      className="absolute group"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : isResizing ? "nwse-resize" : "default",
      }}
    >
      <div
        className="absolute -top-1 -left-7 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card/80 backdrop-blur-sm rounded p-1 shadow-sm"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      <button
        onClick={() => onDelete(id)}
        className="absolute -top-1 -right-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 z-10 bg-card/80 backdrop-blur-sm rounded p-1 shadow-sm"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div
        ref={contentRef}
        className="relative border-2 border-dashed border-transparent group-hover:border-primary/30 rounded transition-colors"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-sm cursor-nwse-rotate opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-primary-foreground/20"
          onMouseDown={handleResizeMouseDown}
        />
        {isEditing ? (
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[300px]">
            <textarea
              value={content}
              onChange={handleContentChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Type your notes here..."
              className="w-full min-h-[100px] p-2 border-none bg-transparent text-foreground text-sm resize-none focus:outline-none"
              autoFocus
            />
          </div>
        ) : (
          <div
            onMouseDown={handleMouseDown}
            className="cursor-move hover:bg-accent/30 rounded-lg p-3 transition-colors select-none min-w-[200px]"
          >
            {content ? (
              <p className="text-foreground text-sm whitespace-pre-wrap">{content}</p>
            ) : (
              <p className="text-muted-foreground italic text-sm">Click to add text</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
