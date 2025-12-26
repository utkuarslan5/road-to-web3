"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationControlsProps {
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
  onNext: () => void
  onPrevious: () => void
  loading?: boolean
}

export function PaginationControls({
  currentPage,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  loading,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious || loading}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <span className="text-sm font-medium text-muted-foreground min-w-[80px] text-center">
        Page {currentPage}
      </span>
      
      <Button
        variant="outline"
        onClick={onNext}
        disabled={!hasNext || loading}
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}


