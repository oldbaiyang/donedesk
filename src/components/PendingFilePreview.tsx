"use client"

import { useState, useEffect } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import heic2any from "heic2any"

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
  const [converting, setConverting] = useState(false);
  
  const isHeic = 
    file.type === "image/heic" || 
    file.type === "image/heif" || 
    file.name.toLowerCase().endsWith(".heic") || 
    file.name.toLowerCase().endsWith(".heif");

  useEffect(() => {
    let objectUrl = "";

    const loadPreview = async () => {
      if (isHeic) {
        setConverting(true);
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.3 // 预览用低质量即可
          });
          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        } catch (err) {
          console.error("HEIC preview conversion failed:", err);
        } finally {
          setConverting(false);
        }
      } else {
        objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);
      }
    };

    loadPreview();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file, isHeic]);

  const isImg = file.type.startsWith('image/') || isHeic;

  return (
    <div className="relative group animate-in zoom-in-50">
      <div className={cn(
        "w-16 h-16 rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center bg-background/50",
        colorClass === "primary" ? "border-primary/40" : "border-indigo-500/40"
      )}>
        {converting ? (
          <Loader2 className={cn("w-4 h-4 animate-spin opacity-40", colorClass === "primary" ? "text-primary" : "text-indigo-500")} />
        ) : isImg && url ? (
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
