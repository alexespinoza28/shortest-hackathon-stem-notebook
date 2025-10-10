"use client"

import { NotebookCanvas } from "@/components/notebook-canvas"
import { useParams } from "next/navigation"
import { Suspense } from "react"

export default function NotebookPage() {
  const params = useParams()
  const notebookId = params.id as string

  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <main className="min-h-screen bg-background">
        <NotebookCanvas notebookId={notebookId} />
      </main>
    </Suspense>
  )
}
