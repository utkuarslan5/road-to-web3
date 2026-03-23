import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Default: Cyan neon pill
        default:
          "border-primary/50 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-glow-cyan",
        // Secondary: Subtle
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Destructive: Red warning
        destructive:
          "border-destructive/50 bg-destructive/20 text-destructive hover:bg-destructive/30",
        // Outline: Border only
        outline:
          "border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
        // Success: Green
        success:
          "border-neon-green/50 bg-neon-green/20 text-neon-green",
        // Week-specific badges
        week1:
          "border-week1/50 bg-week1/20 text-week1 hover:bg-week1/30 hover:shadow-glow-week1",
        week2:
          "border-week2/50 bg-week2/20 text-week2 hover:bg-week2/30 hover:shadow-glow-week2",
        week3:
          "border-week3/50 bg-week3/20 text-week3 hover:bg-week3/30 hover:shadow-glow-week3",
        week4:
          "border-week4/50 bg-week4/20 text-week4 hover:bg-week4/30 hover:shadow-glow-week4",
        // Arcade special badges
        player1:
          "border-neon-cyan/50 bg-neon-cyan/20 text-neon-cyan animate-neon-pulse",
        level:
          "border-neon-yellow/50 bg-neon-yellow/20 text-neon-yellow",
        score:
          "border-neon-magenta/50 bg-neon-magenta/20 text-neon-magenta font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
