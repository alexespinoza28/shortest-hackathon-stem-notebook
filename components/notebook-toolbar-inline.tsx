"use client"

import { Button } from "@/components/ui/button"
import { Calculator, FileText, CheckSquare, Magnet } from "lucide-react"

interface NotebookToolbarInlineProps {
  onInsert: (type: string) => void
  snapToLines: boolean
  onToggleSnap: () => void
}

export function NotebookToolbar({ onInsert, snapToLines, onToggleSnap }: NotebookToolbarInlineProps) {
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
      <div className="h-6 w-px bg-border mx-1" />
      <Button
        variant={snapToLines ? "default" : "ghost"}
        size="sm"
        onClick={onToggleSnap}
        title={snapToLines ? "Disable snap to notebook lines" : "Enable snap to notebook lines"}
        className="gap-1"
      >
        <Magnet className="w-4 h-4" />
        <span className="text-xs font-medium">{snapToLines ? "Snap on" : "Snap off"}</span>
      </Button>
    </div>
  )
}
