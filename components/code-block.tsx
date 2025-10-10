"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Loader2, Terminal } from "lucide-react"
import dynamic from "next/dynamic"

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="text-muted-foreground">Loading code editor...</div>,
})

interface CodeBlockProps {
  content: string
  onUpdate: (content: string) => void
}

export function CodeBlock({ content, onUpdate }: CodeBlockProps) {
  const [code, setCode] = useState(content || '# Write your Python code here\nprint("Hello, STEM Notebook!")')
  const [output, setOutput] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const pyodideRef = useRef<any>(null)

  useEffect(() => {
    setCode(content || '# Write your Python code here\nprint("Hello, STEM Notebook!")')
  }, [content])

  useEffect(() => {
    // Load Pyodide
    const loadPyodide = async () => {
      try {
        if (typeof window !== "undefined" && !pyodideRef.current) {
          // @ts-ignore
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
          })
          pyodideRef.current = pyodide
          setPyodideReady(true)
        }
      } catch (error) {
        console.error("[v0] Failed to load Pyodide:", error)
        setOutput("Failed to load Python runtime. Please refresh the page.")
      }
    }

    loadPyodide()
  }, [])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ""
    setCode(newCode)
    onUpdate(newCode)
  }

  const runCode = async () => {
    if (!pyodideReady || !pyodideRef.current) {
      setOutput("Python runtime is still loading. Please wait...")
      return
    }

    setIsRunning(true)
    setOutput("")

    try {
      const pyodide = pyodideRef.current

      // Capture stdout
      let outputBuffer = ""
      pyodide.setStdout({
        batched: (text: string) => {
          outputBuffer += text + "\n"
        },
      })

      // Run the code
      await pyodide.runPythonAsync(code)

      setOutput(outputBuffer || "Code executed successfully (no output)")
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Code editor */}
      <div className="border-2 border-border rounded-lg overflow-hidden">
        <Editor
          height="200px"
          defaultLanguage="python"
          value={code}
          onChange={handleCodeChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: "on",
          }}
        />
      </div>

      {/* Run button */}
      <Button
        onClick={runCode}
        disabled={isRunning || !pyodideReady}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Running...
          </>
        ) : !pyodideReady ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading Python Runtime...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Run Code
          </>
        )}
      </Button>

      {/* Output */}
      {output && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3 text-muted-foreground" />
            <label className="text-xs font-medium text-muted-foreground">Output</label>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 font-mono text-sm">
            <pre className="whitespace-pre-wrap text-foreground">{output}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
