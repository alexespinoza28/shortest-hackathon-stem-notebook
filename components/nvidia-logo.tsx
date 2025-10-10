import { Book } from "lucide-react"

export function NvidiaLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`${className} flex items-center justify-center bg-primary rounded-lg`}>
      <Book className="w-full h-full p-1.5 text-primary-foreground" />
    </div>
  )
}
