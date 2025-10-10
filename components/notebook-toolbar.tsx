"use client";

import { Button } from "@/components/ui/button";
import { Type, Calculator, Code2, BarChart3, Sparkles } from "lucide-react";
import type { BlockType } from "./notebook-canvas";

interface NotebookToolbarProps {
  onAddBlock: (type: BlockType) => void;
}

export function NotebookToolbar({ onAddBlock }: NotebookToolbarProps) {
  const tools = [
    { type: "text" as BlockType, icon: Type, label: "Text" },
    { type: "equation" as BlockType, icon: Calculator, label: "Equation" },
    { type: "code" as BlockType, icon: Code2, label: "Code" },
    { type: "graph" as BlockType, icon: BarChart3, label: "Graph" },
    { type: "ai" as BlockType, icon: Sparkles, label: "AI Assistant" },
  ];

  return (
    <div className="w-64 border-r border-border bg-card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-primary mb-1">Add Blocks</h2>
        <p className="text-sm text-muted-foreground">
          Click to add to your notebook
        </p>
      </div>

      <div className="space-y-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Button
              key={tool.type}
              variant="outline"
              className="w-full justify-start hover:bg-accent hover:text-accent-foreground bg-transparent"
              onClick={() => onAddBlock(tool.type)}
            >
              <Icon className="w-4 h-4 mr-3" />
              {tool.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Drag blocks to
          reorder them in your notebook
        </p>
      </div>
    </div>
  );
}
