"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical, Trash2, Wand2 } from "lucide-react"
import { BlockMath } from "react-katex"
import katex from "katex"
import "katex/dist/katex.min.css"

interface EquationBlockProps {
  id: string
  initialContent?: string
  position: { x: number; y: number }
  scale: number
  onUpdate: (id: string, content: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  onScale: (id: string, scale: number) => void
}

export function EquationBlock({
  id,
  initialContent = "",
  position,
  scale,
  onUpdate,
  onDelete,
  onMove,
  onScale,
}: EquationBlockProps) {
  const [content, setContent] = useState(initialContent)
  const [isEditing, setIsEditing] = useState(!initialContent)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; hasMoved: boolean } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startScale: number; startWidth: number } | null>(null)
  const dragHandleRef = useRef<HTMLDivElement>(null)
  const originalContentRef = useRef(initialContent)

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

    // Set up listeners immediately
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return

      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Start dragging if moved more than 3 pixels
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

    const handleMouseUp = (e: MouseEvent) => {
      // If we didn't move, treat it as a click to edit
      if (dragRef.current && !dragRef.current.hasMoved && !isEditing) {
        setIsEditing(true)
        // Store the current content when entering edit mode
        originalContentRef.current = content
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

    const handleMouseUp = (e: MouseEvent) => {
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

  // Check if text looks like LaTeX (has common LaTeX commands)
  const isLikelyLatex = (text: string): boolean => {
    const latexPatterns = [
      /\\/,           // Has backslash
      /\\int/,        // Integral
      /\\frac/,       // Fraction
      /\\sum/,        // Sum
      /\\sqrt/,       // Square root
      /\\lim/,        // Limit
      /\\prod/,       // Product
      /\^/,           // Superscript
      /_/,            // Subscript
      /\\[a-zA-Z]+/,  // Any LaTeX command
    ]
    return latexPatterns.some(pattern => pattern.test(text))
  }

  // Check if LaTeX is valid by trying to parse it
  const isValidLatex = (text: string): boolean => {
    if (!text.trim()) return false

    try {
      // Try to render it (this will throw if invalid)
      katex.renderToString(text, { throwOnError: true })
      return true
    } catch (e) {
      return false
    }
  }

  const convertToLatex = async (text: string) => {
    if (!text.trim()) return text

    setIsConverting(true)
    try {
      const response = await fetch("/api/latex-convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) throw new Error("Conversion failed")

      const data = await response.json()
      return data.latex || text
    } catch (error) {
      console.error("LaTeX conversion error:", error)
      return text
    } finally {
      setIsConverting(false)
    }
  }

  const handleBlur = async () => {
    if (!content.trim()) {
      // Delete the block if empty
      onDelete(id)
      return
    }

    // Only convert if:
    // 1. Content has changed
    // 2. Either content doesn't look like LaTeX OR LaTeX is broken
    const hasChanged = content !== originalContentRef.current
    const looksLikeLatex = isLikelyLatex(content)
    const latexIsValid = looksLikeLatex ? isValidLatex(content) : false

    console.log('Blur check:', { hasChanged, content, original: originalContentRef.current, looksLikeLatex, latexIsValid })

    // Convert if changed and (not latex-like OR latex is broken)
    const needsConversion = hasChanged && (!looksLikeLatex || !latexIsValid)

    console.log('Need conversion?', needsConversion)

    if (needsConversion) {
      // Auto-convert natural language to LaTeX
      const latexCode = await convertToLatex(content)
      setContent(latexCode)
      onUpdate(id, latexCode)
      originalContentRef.current = latexCode
    }

    setIsEditing(false)
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()

      if (!content.trim()) {
        // Delete the block if empty on Enter
        onDelete(id)
        return
      }

      // Only convert if content has changed and (not latex-like OR latex is broken)
      const hasChanged = content !== originalContentRef.current
      const looksLikeLatex = isLikelyLatex(content)
      const latexIsValid = looksLikeLatex ? isValidLatex(content) : false

      console.log('Enter check:', { hasChanged, content, original: originalContentRef.current, looksLikeLatex, latexIsValid })

      // Convert if changed and (not latex-like OR latex is broken)
      const needsConversion = hasChanged && (!looksLikeLatex || !latexIsValid)

      console.log('Need conversion?', needsConversion)

      if (needsConversion) {
        // Auto-convert natural language to LaTeX
        const latexCode = await convertToLatex(content)
        setContent(latexCode)
        onUpdate(id, latexCode)
        originalContentRef.current = latexCode
      }

      setIsEditing(false)
    }
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
      {/* Drag Handle */}
      <div
        ref={dragHandleRef}
        className="absolute -top-1 -left-7 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card/80 backdrop-blur-sm rounded p-1 shadow-sm"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(id)}
        className="absolute -top-1 -right-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 z-10 bg-card/80 backdrop-blur-sm rounded p-1 shadow-sm"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Content with dashed border on hover */}
      <div
        ref={contentRef}
        className="relative border-2 border-dashed border-transparent group-hover:border-primary/30 rounded transition-colors"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Resize Handle - Bottom Right Corner */}
        <div
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-sm cursor-nwse-rotate opacity-0 group-hover:opacity-100 transition-opacity z-20 border border-primary-foreground/20"
          onMouseDown={handleResizeMouseDown}
          title="Drag to resize"
        />
        {isEditing ? (
          <div className="space-y-2 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[300px]">
            <textarea
              value={content}
              onChange={handleContentChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Type in natural language (e.g., 'integral of x squared from 0 to 100')"
              className="w-full min-h-[80px] p-2 border border-border rounded bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {isConverting ? (
                <span className="flex items-center gap-1">
                  <Wand2 className="w-3 h-3 animate-spin" />
                  Converting to LaTeX...
                </span>
              ) : (
                "Press Enter to convert • Shift+Enter for new line"
              )}
            </p>
          </div>
        ) : (
          <div
            onMouseDown={handleMouseDown}
            className="cursor-move hover:bg-accent/30 rounded-lg p-2 transition-colors select-none"
          >
            {content ? (
              <BlockMath math={content} />
            ) : (
              <p className="text-muted-foreground italic text-sm bg-card/50 backdrop-blur-sm rounded p-2">
                Click to add equation
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
