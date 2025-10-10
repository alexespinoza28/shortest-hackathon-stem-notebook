"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2 } from "lucide-react"

interface AIBlockProps {
  content: string
  onUpdate: (content: string) => void
}

export function AIBlock({ content, onUpdate }: AIBlockProps) {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState(content)
  const [isLoading, setIsLoading] = useState(false)

  const handleAskAI = async () => {
    if (!prompt.trim()) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      const data = await res.json()

      if (data.error) {
        setResponse(`Error: ${data.error}`)
      } else {
        const fullContent = `**Question:** ${prompt}\n\n**Answer:**\n${data.response}`
        setResponse(fullContent)
        onUpdate(fullContent)
      }
    } catch (error) {
      console.error("[v0] AI request failed:", error)
      setResponse("Failed to get AI response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Prompt input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Ask the AI Assistant</label>
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Explain the Pythagorean theorem..."
            className="flex-1 min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAskAI()
              }
            }}
          />
        </div>
        <Button
          onClick={handleAskAI}
          disabled={isLoading || !prompt.trim()}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI (Cmd/Ctrl + Enter)
            </>
          )}
        </Button>
      </div>

      {/* Response display */}
      {response && (
        <div className="border-t-2 border-border pt-4">
          <label className="text-sm font-medium text-foreground mb-2 block">AI Response</label>
          <div className="bg-muted/50 rounded-lg p-4 prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">{response}</div>
          </div>
        </div>
      )}
    </div>
  )
}
