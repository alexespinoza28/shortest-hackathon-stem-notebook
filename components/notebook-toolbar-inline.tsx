"use client"

import { Button } from "@/components/ui/button"
import { Calculator, FileText, CheckSquare } from "lucide-react"

interface NotebookToolbarInlineProps {
  onInsert: (type: string) => void
}

export function NotebookToolbar({ onInsert }: NotebookToolbarInlineProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => onInsert("text")} title="Insert Text">
        <FileText className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onInsert("equation")} title="Insert Equation">
        <Calculator className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onInsert("todo")} title="Insert TODO List">
        <CheckSquare className="w-4 h-4" />
      </Button>
    </div>
  )
}
