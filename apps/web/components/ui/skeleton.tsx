import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-bezel relative overflow-hidden",
        // Shimmer animation
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-shimmer before:bg-gradient-to-r",
        "before:from-transparent before:via-primary/5 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
