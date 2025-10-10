export interface NotebookMetadata {
  id: string
  title: string
  subject: string
  description: string
  createdAt: number
  updatedAt: number
  colorTheme: string
}

// Block interface for pages
export interface Block {
  id: string
  type: "equation" | "text" | "todo"
  content?: string
  items?: { id: string; text: string; checked: boolean }[]
  position: { x: number; y: number }
  scale: number
}

// Page interface for multi-page notebooks
export interface NotebookPage {
  id: string
  title: string
  blocks: Block[]
  createdAt: number
}

// Content structure for multi-page notebooks
export interface NotebookContent {
  pages: NotebookPage[]
  currentPageId: string
}

const NOTEBOOKS_KEY = "stem-notebooks-list"

export function getAllNotebooks(): NotebookMetadata[] {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(NOTEBOOKS_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch (e) {
    console.error("Failed to load notebooks:", e)
    return []
  }
}

export function getNotebook(id: string): NotebookMetadata | null {
  const notebooks = getAllNotebooks()
  return notebooks.find((n) => n.id === id) || null
}

export function createNotebook(
  title: string,
  subject: string = "General",
  description: string = "",
  colorTheme: string = "default"
): NotebookMetadata {
  const notebooks = getAllNotebooks()

  const newNotebook: NotebookMetadata = {
    id: `notebook-${Date.now()}`,
    title,
    subject,
    description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    colorTheme,
  }

  notebooks.push(newNotebook)
  localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks))

  return newNotebook
}

export function updateNotebook(id: string, updates: Partial<NotebookMetadata>): void {
  const notebooks = getAllNotebooks()
  const index = notebooks.findIndex((n) => n.id === id)

  if (index !== -1) {
    notebooks[index] = {
      ...notebooks[index],
      ...updates,
      updatedAt: Date.now(),
    }
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(notebooks))
  }
}

export function deleteNotebook(id: string): void {
  const notebooks = getAllNotebooks()
  const filtered = notebooks.filter((n) => n.id !== id)
  localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(filtered))

  // Also delete the notebook content
  localStorage.removeItem(`notebook-${id}`)
}

export function duplicateNotebook(id: string): NotebookMetadata | null {
  const notebook = getNotebook(id)
  if (!notebook) return null

  const newNotebook = createNotebook(
    `${notebook.title} (Copy)`,
    notebook.subject,
    notebook.description,
    notebook.colorTheme
  )

  // Copy the content
  const content = localStorage.getItem(`notebook-${id}`)
  if (content) {
    localStorage.setItem(`notebook-${newNotebook.id}`, content)
  }

  return newNotebook
}

export function getNotebookBlockCount(id: string): number {
  const content = getNotebookContent(id)
  if (!content) return 0

  // Count blocks across all pages
  return content.pages.reduce((total, page) => total + page.blocks.length, 0)
}

// ===== MULTI-PAGE UTILITIES =====

/**
 * Get notebook content with pages structure
 * Automatically migrates old format (flat block array) to new format
 */
export function getNotebookContent(id: string): NotebookContent | null {
  if (typeof window === "undefined") return null

  const stored = localStorage.getItem(`notebook-${id}`)
  if (!stored) {
    // Create default content with one page
    const pageId = `page-${Date.now()}`
    const defaultContent: NotebookContent = {
      pages: [
        {
          id: pageId,
          title: "Page 1",
          blocks: [],
          createdAt: Date.now(),
        },
      ],
      currentPageId: pageId,
    }
    return defaultContent
  }

  try {
    const parsed = JSON.parse(stored)

    // Check if old format (flat array of blocks)
    if (Array.isArray(parsed)) {
      // Migrate to new format
      console.log(`Migrating notebook ${id} to multi-page format`)
      const pageId = `page-${Date.now()}`
      const migrated: NotebookContent = {
        pages: [
          {
            id: pageId,
            title: "Page 1",
            blocks: parsed,
            createdAt: Date.now(),
          },
        ],
        currentPageId: pageId,
      }
      // Save migrated format
      localStorage.setItem(`notebook-${id}`, JSON.stringify(migrated))
      return migrated
    }

    // Already in new format
    return parsed as NotebookContent
  } catch (e) {
    console.error("Failed to load notebook content:", e)
    return null
  }
}

/**
 * Save notebook content
 */
export function saveNotebookContent(id: string, content: NotebookContent): void {
  if (typeof window === "undefined") return

  localStorage.setItem(`notebook-${id}`, JSON.stringify(content))
  updateNotebook(id, { updatedAt: Date.now() })
}

/**
 * Create a new page in a notebook
 */
export function createPage(notebookId: string, title?: string): NotebookPage {
  const content = getNotebookContent(notebookId)
  if (!content) throw new Error("Notebook not found")

  const pageNumber = content.pages.length + 1
  const newPage: NotebookPage = {
    id: `page-${Date.now()}`,
    title: title || `Page ${pageNumber}`,
    blocks: [],
    createdAt: Date.now(),
  }

  content.pages.push(newPage)
  content.currentPageId = newPage.id
  saveNotebookContent(notebookId, content)

  return newPage
}

/**
 * Delete a page from a notebook
 */
export function deletePage(notebookId: string, pageId: string): boolean {
  const content = getNotebookContent(notebookId)
  if (!content) return false

  // Prevent deleting last page
  if (content.pages.length === 1) {
    console.warn("Cannot delete the last page")
    return false
  }

  const pageIndex = content.pages.findIndex((p) => p.id === pageId)
  if (pageIndex === -1) return false

  // Remove the page
  content.pages.splice(pageIndex, 1)

  // If deleted page was current, switch to first page
  if (content.currentPageId === pageId) {
    content.currentPageId = content.pages[0].id
  }

  saveNotebookContent(notebookId, content)
  return true
}

/**
 * Rename a page
 */
export function renamePage(notebookId: string, pageId: string, newTitle: string): boolean {
  const content = getNotebookContent(notebookId)
  if (!content) return false

  const page = content.pages.find((p) => p.id === pageId)
  if (!page) return false

  page.title = newTitle
  saveNotebookContent(notebookId, content)
  return true
}

/**
 * Get blocks for a specific page
 */
export function getPageBlocks(notebookId: string, pageId: string): Block[] {
  const content = getNotebookContent(notebookId)
  if (!content) return []

  const page = content.pages.find((p) => p.id === pageId)
  return page?.blocks || []
}

/**
 * Save blocks to a specific page
 */
export function savePageBlocks(notebookId: string, pageId: string, blocks: Block[]): void {
  const content = getNotebookContent(notebookId)
  if (!content) return

  const page = content.pages.find((p) => p.id === pageId)
  if (!page) return

  page.blocks = blocks
  saveNotebookContent(notebookId, content)
}

/**
 * Switch to a different page
 */
export function switchToPage(notebookId: string, pageId: string): boolean {
  const content = getNotebookContent(notebookId)
  if (!content) return false

  const page = content.pages.find((p) => p.id === pageId)
  if (!page) return false

  content.currentPageId = pageId
  saveNotebookContent(notebookId, content)
  return true
}

/**
 * Get page count for a notebook
 */
export function getPageCount(id: string): number {
  const content = getNotebookContent(id)
  return content?.pages.length || 0
}
