import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const textareaVariants = cva(
  [
    "flex min-h-[96px] w-full rounded-lg border-2 bg-screen px-4 py-3 text-base text-foreground ring-offset-background transition-all duration-200",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  ],
  {
    variants: {
      variant: {
        default:
          "border-border hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-glow-cyan",
        week1:
          "border-week1/30 hover:border-week1/50 focus-visible:border-week1 focus-visible:ring-2 focus-visible:ring-week1/20 focus-visible:shadow-glow-week1",
        week2:
          "border-week2/30 hover:border-week2/50 focus-visible:border-week2 focus-visible:ring-2 focus-visible:ring-week2/20 focus-visible:shadow-glow-week2",
        week3:
          "border-week3/30 hover:border-week3/50 focus-visible:border-week3 focus-visible:ring-2 focus-visible:ring-week3/20 focus-visible:shadow-glow-week3",
        week4:
          "border-week4/30 hover:border-week4/50 focus-visible:border-week4 focus-visible:ring-2 focus-visible:ring-week4/20 focus-visible:shadow-glow-week4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, variant, ...props }, ref) => {
  return (
    <textarea
      className={cn(textareaVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
