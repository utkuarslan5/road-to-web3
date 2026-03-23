import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const cardVariants = cva(
  "rounded-xl border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        // Default: Cabinet dark with subtle border
        default: "bg-card border-border shadow-arcade",
        // Arcade: With scanline texture and glow potential
        arcade:
          "bg-card border-border shadow-arcade hover:shadow-arcade-hover hover:border-primary/30 arcade-card",
        // Score: High-score board styling
        score:
          "bg-cabinet border-2 border-bezel shadow-arcade relative overflow-hidden",
        // Week-specific cards
        week1:
          "bg-card border-week1/30 hover:border-week1/60 hover:shadow-glow-week1",
        week2:
          "bg-card border-week2/30 hover:border-week2/60 hover:shadow-glow-week2",
        week3:
          "bg-card border-week3/30 hover:border-week3/60 hover:shadow-glow-week3",
        week4:
          "bg-card border-week4/30 hover:border-week4/60 hover:shadow-glow-week4",
        // Ghost: Minimal border
        ghost: "bg-transparent border-border/50 hover:border-border",
        // Glass: Shared elevated surface used by app-level pages
        glass: "glass bg-card/85 border-border/70 shadow-arcade",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const cardHeaderVariants = cva("flex flex-col", {
  variants: {
    spacing: {
      default: "gap-1.5",
      roomy: "gap-4",
    },
    padding: {
      default: "p-6",
      roomy: "p-8",
      flush: "p-0",
    },
  },
  defaultVariants: {
    spacing: "default",
    padding: "default",
  },
})

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardHeaderVariants>
>(({ className, spacing, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardHeaderVariants({ spacing, padding }), className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const cardTitleVariants = cva(
  "font-display font-semibold leading-none tracking-tight",
  {
    variants: {
      size: {
        sm: "text-base",
        default: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  }
)

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardTitleVariants>
>(({ className, size, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(cardTitleVariants({ size }), className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const cardContentVariants = cva("", {
  variants: {
    padding: {
      default: "p-6 pt-0",
      roomy: "p-8 pt-0",
      flush: "p-0",
    },
  },
  defaultVariants: {
    padding: "default",
  },
})

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardContentVariants>
>(({ className, padding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardContentVariants({ padding }), className)}
    {...props}
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
}
