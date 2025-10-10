export interface NotebookMetadata {
  id: string
  title: string
  subject: string
  description: string
  createdAt: number
  updatedAt: number
  colorTheme: string
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
  const content = localStorage.getItem(`notebook-${id}`)
  if (!content) return 0

  try {
    const blocks = JSON.parse(content)
    return Array.isArray(blocks) ? blocks.length : 0
  } catch {
    return 0
  }
}
