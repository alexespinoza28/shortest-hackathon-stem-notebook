import Image from "next/image"

export function NvidiaLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <Image
      src="/nvidia-logo.png"
      alt="NVIDIA Logo"
      width={80}
      height={80}
      className={className}
    />
  )
}
