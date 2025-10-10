"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MarkdownContent } from "./markdown-content"

interface TodoItem {
  id: string
  text: string
  checked: boolean
}

interface Block {
  id: string
  type: "equation" | "text" | "todo"
  content?: string
  items?: TodoItem[]
  position: { x: number; y: number }
  scale: number
}

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  blocks: Block[]
}

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AiSidebar({ isOpen, onClose, blocks }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [width, setWidth] = useState(384)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  // Handle resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !sidebarRef.current) return

      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 320 && newWidth <= 800) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.body.style.cursor = "default"
      document.body.style.userSelect = "auto"
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  // Build context from blocks
  const buildContext = () => {
    if (blocks.length === 0) return ""

    const context = blocks.map((block, index) => {
      if (block.type === "equation" && block.content) {
        return `Equation ${index + 1}: ${block.content}`
      } else if (block.type === "text" && block.content) {
        return `Note ${index + 1}: ${block.content}`
      } else if (block.type === "todo" && block.items) {
        const todos = block.items.map(item => `- ${item.checked ? "[x]" : "[ ]"} ${item.text}`).join("\n")
        return `Todo List ${index + 1}:\n${todos}`
      }
      return ""
    }).filter(Boolean).join("\n\n")

    return context ? `\n\nCurrent notebook content:\n${context}` : ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    const context = buildContext()
    const fullPrompt = context ? `${userMessage}${context}` : userMessage

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      if (!response.ok) throw new Error("Failed to get AI response")

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ""

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = (await reader?.read()) || {}
        if (done) break

        const chunk = decoder.decode(value)
        aiResponse += chunk

        setMessages((prev) => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1].content = aiResponse
          return newMessages
        })
      }
    } catch (error) {
      console.error("AI Error:", error)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={sidebarRef}
      className="border-l border-border bg-card flex flex-col relative"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-10"
        onMouseDown={handleMouseDown}
      />
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-foreground">Nemotron Assistant</h2>
          <p className="text-xs text-muted-foreground">Powered by NVIDIA</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>Ask me anything about STEM topics!</p>
            <p className="mt-2 text-xs">I can help explain concepts, solve problems, and more.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg break-words ${
                  message.role === "user" ? "bg-primary text-primary-foreground ml-4" : "bg-muted text-foreground mr-4"
                }`}
              >
                {message.role === "user" ? (
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                ) : (
                  <MarkdownContent content={message.content} />
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="min-h-[60px] max-h-[120px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} className="flex-shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </form>
    </div>
  )
}
