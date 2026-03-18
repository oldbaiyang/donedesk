"use client"

import { useState, useEffect } from "react"
import { Upload, X, Loader2 } from "lucide-react"
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
  const [converting, setConverting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  
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
        setErrorMsg("");
        try {
          const heicModule = await import("heic2any");
          const heic2anyFn = heicModule.default || heicModule;
          
          if (typeof heic2anyFn !== 'function') {
            throw new Error(`heic2any is not a function.`);
          }

          // Try to pass a pure Blob instead of a File object
          const pureBlob = new Blob([await file.arrayBuffer()], { type: 'image/heic' });

          const convertedBlob = await heic2anyFn({
            blob: pureBlob,
            toType: "image/jpeg",
            quality: 0.3 // 预览用低质量即可
          });

          const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        } catch (err: any) {
          console.error("HEIC preview conversion failed:", err);
          const errorStr = err instanceof Error ? err.message : JSON.stringify(err);
          setErrorMsg(errorStr === "{}" ? "Web Worker failure (Empty Object {})" : errorStr);
          setUrl(""); // 清除可能的错误 URL
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
        "w-16 h-16 rounded-xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center bg-background/50",
        colorClass === "primary" ? "border-primary/40" : "border-indigo-500/40",
        errorMsg && "border-destructive/40 bg-destructive/5"
      )}>
        {converting ? (
          <Loader2 className={cn("w-4 h-4 animate-spin opacity-40", colorClass === "primary" ? "text-primary" : "text-indigo-500")} />
        ) : errorMsg ? (
           <div className="flex flex-col items-center justify-center p-1 text-center">
             <span className="text-[8px] leading-tight text-destructive font-bold break-all max-h-[14px] overflow-hidden text-ellipsis">ERR</span>
             <span className="text-[8px] leading-none text-destructive opacity-70 break-all">{errorMsg.substring(0, 10)}</span>
           </div>
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
