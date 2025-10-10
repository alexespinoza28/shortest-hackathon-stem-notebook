"use client"

import { Button } from "@/components/ui/button"
import { Calculator, Code, Heading1 } from "lucide-react"
import type { BlockType } from "./notebook-canvas"

interface NotebookToolbarInlineProps {
  onInsert: (type: BlockType) => void
}

export function NotebookToolbar({ onInsert }: NotebookToolbarInlineProps) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" onClick={() => onInsert("heading")} title="Insert Heading">
        <Heading1 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onInsert("equation")} title="Insert Equation">
        <Calculator className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onInsert("code")} title="Insert Code Block">
        <Code className="w-4 h-4" />
      </Button>
    </div>
  )
}
