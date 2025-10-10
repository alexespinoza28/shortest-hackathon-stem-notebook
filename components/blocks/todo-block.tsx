"use client"

import { useState, useRef, useEffect } from "react"
import { GripVertical, Trash2, Plus } from "lucide-react"

interface TodoItem {
  id: string
  text: string
  checked: boolean
}

interface TodoBlockProps {
  id: string
  initialItems?: TodoItem[]
  position: { x: number; y: number }
  scale: number
  onUpdate: (id: string, items: TodoItem[]) => void
  onDelete: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  onScale: (id: string, scale: number) => void
}

export function TodoBlock({
  id,
  initialItems = [],
  position,
  scale,
  onUpdate,
  onDelete,
  onMove,
  onScale,
}: TodoBlockProps) {
  const [items, setItems] = useState<TodoItem[]>(initialItems.length > 0 ? initialItems : [{ id: "1", text: "", checked: false }])
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; offsetX: number; offsetY: number; hasMoved: boolean } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startScale: number; startWidth: number } | null>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') return
    
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

  const updateItems = (newItems: TodoItem[]) => {
    setItems(newItems)
    onUpdate(id, newItems)
  }

  const toggleItem = (itemId: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    )
    updateItems(newItems)
  }

  const updateItemText = (itemId: string, text: string) => {
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, text } : item
    )
    updateItems(newItems)
  }

  const addItem = () => {
    const newItems = [...items, { id: Date.now().toString(), text: "", checked: false }]
    updateItems(newItems)
  }

  const deleteItem = (itemId: string) => {
    if (items.length === 1) return
    const newItems = items.filter(item => item.id !== itemId)
    updateItems(newItems)
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
        <div
          onMouseDown={handleMouseDown}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 min-w-[250px]"
        >
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleItem(item.id)}
                  className="w-4 h-4 rounded border-border"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  placeholder="Add task..."
                  className={`flex-1 bg-transparent border-none text-foreground text-sm focus:outline-none ${
                    item.checked ? "line-through text-muted-foreground" : ""
                  }`}
                />
                {items.length > 1 && (
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addItem}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
