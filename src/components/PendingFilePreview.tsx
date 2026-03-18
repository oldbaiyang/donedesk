"use client"

import { useState, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function PendingFilePreview({ 
  file, 
  onRemove, 
  colorClass = "primary" 
}: { 
  file: File, 
  onRemove: () => void, 
  colorClass?: "primary" | "indigo" 
}) {
  const [url, setUrl] = useState<string>("");
  
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const isImg = file.type.startsWith('image/');

  return (
    <div className="relative group animate-in zoom-in-50">
      <div className={cn(
        "w-16 h-16 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center bg-background/50",
        colorClass === "primary" ? "border-primary/40" : "border-indigo-500/40"
      )}>
        {isImg && url ? (
          <img src={url} className="w-full h-full object-cover opacity-60 grayscale-[0.3]" alt="Preview" />
        ) : (
          <Upload className={cn("w-4 h-4 opacity-40", colorClass === "primary" ? "text-primary" : "text-indigo-500")} />
        )}
      </div>
      <button 
        type="button"
        onClick={onRemove} 
        className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform"
        title="移除"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
