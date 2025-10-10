"use client"

import { useState } from "react"
import { NotebookPage } from "@/lib/notebook-utils"
import { Plus, FileText, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PagesSidebarProps {
  pages: NotebookPage[]
  currentPageId: string
  isOpen: boolean
  onToggle: () => void
  onPageSelect: (pageId: string) => void
  onPageCreate: () => void
  onPageDelete: (pageId: string) => void
  onPageRename: (pageId: string, newTitle: string) => void
}

export function PagesSidebar({
  pages,
  currentPageId,
  isOpen,
  onToggle,
  onPageSelect,
  onPageCreate,
  onPageDelete,
  onPageRename,
}: PagesSidebarProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")

  const handleStartEdit = (page: NotebookPage) => {
    setEditingPageId(page.id)
    setEditingTitle(page.title)
  }

  const handleSaveEdit = (pageId: string) => {
    if (editingTitle.trim()) {
      onPageRename(pageId, editingTitle.trim())
    }
    setEditingPageId(null)
    setEditingTitle("")
  }

  const handleCancelEdit = () => {
    setEditingPageId(null)
    setEditingTitle("")
  }

  const handleKeyDown = (e: React.KeyboardEvent, pageId: string) => {
    if (e.key === "Enter") {
      handleSaveEdit(pageId)
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`bg-card border-r border-border flex flex-col transition-all duration-300 ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm text-foreground">Pages</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Pages List */}
        <div className="flex-1 overflow-y-auto p-2">
          {pages.map((page) => {
            const isActive = page.id === currentPageId
            const isEditing = editingPageId === page.id

            return (
              <div
                key={page.id}
                className={`group relative rounded-md mb-1 transition-colors ${
                  isActive
                    ? "bg-primary/10 ring-2 ring-primary/50"
                    : "hover:bg-muted"
                }`}
              >
                {isEditing ? (
                  <div className="px-3 py-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleSaveEdit(page.id)}
                      onKeyDown={(e) => handleKeyDown(e, page.id)}
                      className="w-full bg-background border border-primary rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => onPageSelect(page.id)}
                    onDoubleClick={() => handleStartEdit(page)}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {page.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {page.blocks.length} block{page.blocks.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                    {/* Action buttons (show on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartEdit(page)
                        }}
                        className="p-1 hover:bg-background rounded"
                        title="Rename page"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (
                              window.confirm(
                                `Delete "${page.title}"? This cannot be undone.`
                              )
                            ) {
                              onPageDelete(page.id)
                            }
                          }}
                          className="p-1 hover:bg-destructive/10 text-destructive rounded"
                          title="Delete page"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Add Page Button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onPageCreate}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            New Page
          </Button>
        </div>
      </div>

      {/* Toggle Button (when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute left-0 top-20 z-50 bg-card border border-l-0 border-border rounded-r-md p-2 hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </>
  )
}
