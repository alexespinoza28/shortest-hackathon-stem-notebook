"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => <div className="text-muted-foreground">Loading graph renderer...</div>,
})

interface GraphBlockProps {
  content: string
  onUpdate: (content: string) => void
}

type GraphType = "line" | "scatter" | "bar" | "function"

export function GraphBlock({ content, onUpdate }: GraphBlockProps) {
  const [graphType, setGraphType] = useState<GraphType>("line")
  const [dataInput, setDataInput] = useState(
    content ||
      `{
  "x": [1, 2, 3, 4, 5],
  "y": [2, 4, 6, 8, 10]
}`,
  )
  const [plotData, setPlotData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (content) {
      setDataInput(content)
      generateGraph(content, graphType)
    }
  }, [content])

  const generateGraph = (input: string, type: GraphType) => {
    setIsGenerating(true)
    setError(null)

    try {
      const data = JSON.parse(input)

      const trace: any = {
        x: data.x || [],
        y: data.y || [],
        mode: type === "scatter" ? "markers" : type === "line" ? "lines+markers" : undefined,
        type: type === "bar" ? "bar" : type === "function" ? "scatter" : "scatter",
        marker: {
          color: "rgb(255, 127, 80)",
          size: 8,
        },
        line: {
          color: "rgb(31, 119, 180)",
          width: 2,
        },
      }

      setPlotData([trace])
      onUpdate(input)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
      setPlotData([])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerate = () => {
    generateGraph(dataInput, graphType)
  }

  const handleTypeChange = (type: GraphType) => {
    setGraphType(type)
    generateGraph(dataInput, type)
  }

  return (
    <div className="space-y-4">
      {/* Graph type selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground">Graph Type:</label>
        <Select value={graphType} onValueChange={(value) => handleTypeChange(value as GraphType)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Graph</SelectItem>
            <SelectItem value="scatter">Scatter Plot</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Data input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Data (JSON format)</label>
        <Textarea
          value={dataInput}
          onChange={(e) => setDataInput(e.target.value)}
          placeholder='{"x": [1, 2, 3], "y": [2, 4, 6]}'
          className="font-mono text-sm min-h-[120px] resize-y"
        />
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Graph
          </>
        )}
      </Button>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Graph display */}
      {plotData.length > 0 && !error && (
        <div className="border-2 border-border rounded-lg p-4 bg-muted/30">
          <Plot
            data={plotData}
            layout={{
              autosize: true,
              margin: { l: 50, r: 30, t: 30, b: 50 },
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: {
                family: "var(--font-geist-sans)",
                size: 12,
              },
              xaxis: {
                gridcolor: "rgba(0,0,0,0.1)",
              },
              yaxis: {
                gridcolor: "rgba(0,0,0,0.1)",
              },
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
            }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>
      )}

      {/* Quick examples */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">Example Data Formats</summary>
        <div className="mt-2 space-y-2 pl-4">
          <div>
            <p className="font-semibold text-foreground mb-1">Simple Line/Scatter:</p>
            <code className="bg-muted px-2 py-1 rounded block">{`{"x": [1, 2, 3, 4, 5], "y": [2, 4, 6, 8, 10]}`}</code>
          </div>
          <div>
            <p className="font-semibold text-foreground mb-1">Quadratic Function:</p>
            <code className="bg-muted px-2 py-1 rounded block">
              {`{"x": [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5], "y": [25, 16, 9, 4, 1, 0, 1, 4, 9, 16, 25]}`}
            </code>
          </div>
        </div>
      </details>
    </div>
  )
}
