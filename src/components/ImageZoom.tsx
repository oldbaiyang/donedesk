"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { cn } from "@/lib/utils"

interface ImageZoomProps {
  src: string
  alt?: string
  className?: string
}

export function ImageZoom({ src, alt, className }: ImageZoomProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <img 
          src={src} 
          alt={alt} 
          className={cn("cursor-zoom-in transition-transform hover:scale-[1.02]", className)}
        />
      </DialogTrigger>
      <DialogContent showCloseButton={true} className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl p-0 overflow-hidden bg-transparent border-none shadow-none ring-0 focus:ring-0">
        <div className="relative group w-full h-full flex items-center justify-center p-4">
          <img 
            src={src} 
            alt={alt} 
            onClick={() => setOpen(false)}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-background/10 backdrop-blur-md transition-all duration-300 animate-in zoom-in-95 ease-out cursor-zoom-out"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
