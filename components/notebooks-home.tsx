"use client"

import { useState, useEffect } from "react"
import { getAllNotebooks, deleteNotebook, NotebookMetadata } from "@/lib/notebook-utils"
import { NotebookCard } from "./notebook-card"
import { NewNotebookDialog } from "./new-notebook-dialog"
import { BookOpen, Search } from "lucide-react"
import { Input } from "./ui/input"
import { NvidiaLogo } from "./nvidia-logo"

export function NotebooksHome() {
  const [notebooks, setNotebooks] = useState<NotebookMetadata[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"updated" | "created" | "title">("updated")

  useEffect(() => {
    loadNotebooks()
  }, [])

  const loadNotebooks = () => {
    const allNotebooks = getAllNotebooks()
    setNotebooks(allNotebooks)
  }

  const handleDelete = (id: string) => {
    deleteNotebook(id)
    loadNotebooks()
  }

  const filteredNotebooks = notebooks
    .filter((notebook) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        notebook.title.toLowerCase().includes(query) ||
        notebook.subject.toLowerCase().includes(query) ||
        notebook.description.toLowerCase().includes(query)
      )
    })
    .sort((a, b) => {
      if (sortBy === "updated") return b.updatedAt - a.updatedAt
      if (sortBy === "created") return b.createdAt - a.createdAt
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return 0
    })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <NvidiaLogo className="w-10 h-10" />
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-gothic-a1)' }}>Nemo Pad</h1>
            </div>
            <NewNotebookDialog />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notebooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="updated">Last Modified</option>
            <option value="created">Date Created</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>

        {/* Notebooks Grid */}
        {filteredNotebooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotebooks.map((notebook) => (
              <NotebookCard key={notebook.id} notebook={notebook} onDelete={handleDelete} onUpdate={loadNotebooks} />
            ))}
          </div>
        ) : notebooks.length === 0 ? (
          /* Empty State - No Notebooks */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-20 h-20 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No notebooks yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first notebook to start taking notes, writing equations, and organizing your
              STEM knowledge.
            </p>
            <NewNotebookDialog />
          </div>
        ) : (
          /* Empty State - No Search Results */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="w-20 h-20 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">No results found</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Try adjusting your search terms or create a new notebook.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
