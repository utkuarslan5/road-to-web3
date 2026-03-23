"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
        className="border-week4/50 hover:border-week4 hover:bg-week4/10 hover:text-week4 disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        PREV
      </Button>

      <Badge variant="week4" className="px-4 py-1.5 font-mono">
        PAGE {currentPage}
      </Badge>

      <Button
        variant="outline"
        onClick={onNext}
        disabled={!hasNext || loading}
        className="border-week4/50 hover:border-week4 hover:bg-week4/10 hover:text-week4 disabled:opacity-30"
      >
        NEXT
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
