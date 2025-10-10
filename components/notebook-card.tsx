"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotebookMetadata, getNotebookBlockCount, duplicateNotebook, updateNotebook } from "@/lib/notebook-utils"
import { BookOpen, Calendar, FileText, MoreVertical, Trash2, Copy, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface NotebookCardProps {
  notebook: NotebookMetadata
  onDelete: (id: string) => void
  onUpdate?: () => void
}

export function NotebookCard({ notebook, onDelete, onUpdate }: NotebookCardProps) {
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newTitle, setNewTitle] = useState(notebook.title)
  const blockCount = getNotebookBlockCount(notebook.id)

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleOpen = () => {
    router.push(`/notebook/${notebook.id}`)
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRenaming(true)
    setShowMenu(false)
  }

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTitle.trim() && newTitle !== notebook.title) {
      updateNotebook(notebook.id, { title: newTitle.trim() })
      onUpdate?.()
    }
    setIsRenaming(false)
  }

  const handleRenameCancel = () => {
    setNewTitle(notebook.title)
    setIsRenaming(false)
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    const duplicated = duplicateNotebook(notebook.id)
    if (duplicated) {
      onUpdate?.()
      router.push(`/notebook/${duplicated.id}`)
    }
    setShowMenu(false)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${notebook.title}"?`)) {
      onDelete(notebook.id)
    }
    setShowMenu(false)
  }

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:border-primary relative group"
      onClick={handleOpen}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isRenaming ? (
              <form onSubmit={handleRenameSubmit} onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onBlur={handleRenameCancel}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') handleRenameCancel()
                  }}
                  className="text-xl font-semibold mb-2 w-full bg-background border border-primary rounded px-2 py-1"
                  autoFocus
                />
              </form>
            ) : (
              <CardTitle className="text-xl mb-2">{notebook.title}</CardTitle>
            )}
            <CardDescription className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {notebook.subject}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {notebook.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{notebook.description}</p>
        </CardContent>
      )}

      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          <span>{blockCount} blocks</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(notebook.updatedAt)}</span>
        </div>
      </CardFooter>

      {showMenu && (
        <div className="absolute top-16 right-4 bg-card border rounded-md shadow-lg z-10 min-w-[150px]">
          <button
            onClick={handleRename}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 rounded-t-md"
          >
            <Edit2 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleDuplicate}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2 text-destructive rounded-b-md"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </Card>
  )
}
