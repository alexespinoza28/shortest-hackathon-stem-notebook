"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Trash2 } from "lucide-react"

interface NotebookInfo {
  id: string
  name: string
  lastModified: number
}

export default function NotebooksPage() {
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<NotebookInfo[]>([])

  useEffect(() => {
    loadNotebooks()
  }, [])

  const loadNotebooks = () => {
    const saved = localStorage.getItem("notebooks-list")
    if (saved) {
      try {
        setNotebooks(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load notebooks list:", e)
      }
    }
  }

  const createNotebook = () => {
    const timestamp = Date.now()
    const id = `notebook-${timestamp}`
    const newNotebook: NotebookInfo = {
      id,
      name: `Untitled ${notebooks.length + 1}`,
      lastModified: timestamp,
    }
    const updated = [...notebooks, newNotebook]
    setNotebooks(updated)
    localStorage.setItem("notebooks-list", JSON.stringify(updated))
    router.push(`/?notebook=${id}`)
  }

  const deleteNotebook = (id: string) => {
    const updated = notebooks.filter(n => n.id !== id)
    setNotebooks(updated)
    localStorage.setItem("notebooks-list", JSON.stringify(updated))
    localStorage.removeItem(id)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Notebooks</h1>
          <Button onClick={createNotebook} className="gap-2">
            <Plus className="w-4 h-4" />
            New Notebook
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className="border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer group relative"
              onClick={() => router.push(`/?notebook=${notebook.id}`)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNotebook(notebook.id)
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <FileText className="w-8 h-8 mb-3 text-primary" />
              <h3 className="font-semibold mb-1">{notebook.name}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(notebook.lastModified).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

        {notebooks.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No notebooks yet</h3>
            <p className="text-muted-foreground mb-4">Create your first notebook to get started</p>
            <Button onClick={createNotebook} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Notebook
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
