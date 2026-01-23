"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Zap } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FeedbackDialog } from "./FeedbackDialog"

export function FeedbackButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const pathname = usePathname()

  // Only show feedback button on educational course pages (/learn routes)
  if (!pathname.startsWith('/learn')) {
    return null
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="hidden md:flex fixed bottom-6 right-6 z-50 h-12 w-12 items-center justify-center rounded-full bg-[#E6CC93] shadow-lg transition-colors hover:bg-[#E6CC93]/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#E6CC93] focus:ring-offset-2 focus:ring-offset-background"
            aria-label="Есть проблема или идея?"
          >
            <Zap className="h-5 w-5 text-gray-600" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          sideOffset={8}
          className="mb-0 rounded-full bg-[#E6CC93] border-0 px-4 py-2 text-sm !text-gray-900 shadow-lg animate-in slide-in-from-right-2 fade-in-0 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-2 data-[state=closed]:fade-out-0"
        >
          <p className="font-medium !text-gray-900">Есть проблема или идея?</p>
        </TooltipContent>
      </Tooltip>
      <FeedbackDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </TooltipProvider>
  )
}
