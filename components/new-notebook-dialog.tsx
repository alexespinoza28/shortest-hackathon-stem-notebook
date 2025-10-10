"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createNotebook } from "@/lib/notebook-utils"
import { Plus, Calculator, Atom, Beaker, Lightbulb } from "lucide-react"
import { useRouter } from "next/navigation"

const TEMPLATES = [
  {
    id: "blank",
    name: "Blank",
    icon: Lightbulb,
    subject: "",
    description: "Start from scratch",
  },
  {
    id: "math",
    name: "Mathematics",
    icon: Calculator,
    subject: "Mathematics",
    description: "Perfect for equations, proofs, and problem solving",
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    subject: "Physics",
    description: "For mechanics, thermodynamics, and quantum physics",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: Beaker,
    subject: "Chemistry",
    description: "Chemical equations, reactions, and lab notes",
  },
]

export function NewNotebookDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<"template" | "details">("template")
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setSubject(template.subject)
    setStep("details")
  }

  const handleCreate = () => {
    if (!title.trim()) {
      alert("Please enter a notebook title")
      return
    }

    const notebook = createNotebook(
      title.trim(),
      subject.trim() || "General",
      description.trim(),
      "default"
    )

    setTitle("")
    setSubject("")
    setDescription("")
    setStep("template")
    setSelectedTemplate(TEMPLATES[0])
    setOpen(false)

    // Navigate to the new notebook
    router.push(`/notebook/${notebook.id}`)
  }

  const handleClose = () => {
    // Reset state when closing
    setStep("template")
    setTitle("")
    setSubject("")
    setDescription("")
    setSelectedTemplate(TEMPLATES[0])
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) handleClose();
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="w-5 h-5" />
          New Notebook
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === "template" ? "Choose a Template" : "Create New Notebook"}
          </DialogTitle>
          <DialogDescription>
            {step === "template"
              ? "Select a template to get started quickly"
              : "Create a new notebook for your notes, equations, and ideas."}
          </DialogDescription>
        </DialogHeader>

        {step === "template" ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {TEMPLATES.map((template) => {
              const Icon = template.icon
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="flex flex-col items-center gap-3 p-6 border-2 rounded-lg hover:border-primary hover:bg-accent transition-all text-center"
                >
                  <Icon className="w-12 h-12 text-primary" />
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Physics Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate()
                  }
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Physics, Math, Chemistry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this notebook..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "details" && (
            <Button variant="outline" onClick={() => setStep("template")}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={() => { handleClose(); setOpen(false); }}>
            Cancel
          </Button>
          {step === "details" && (
            <Button onClick={handleCreate}>Create Notebook</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
