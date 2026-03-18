"use client"

import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { Markdown } from 'tiptap-markdown'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "支持 Markdown 语法...", 
  className,
  minHeight = "300px"
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-2xl border border-border/40 shadow-sm w-[200px] h-[200px] object-cover !inline-block mr-4 mb-4',
        },
      }),
      Markdown.configure({
        html: false,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
          "min-h-full p-6",
        ),
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      // 避免在 editor 已销毁时操作
      if (editor.isDestroyed) return
      const markdown = editor.storage.markdown.getMarkdown()
      onChange(markdown)
    },
  })

  // 同步外部状态（仅在非内部更新时）
  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className={cn("rounded-3xl bg-muted/20 border border-border/40 animate-pulse", className)} style={{ minHeight }}>
        <div className="p-6 text-muted-foreground/40 text-sm">加载编辑器中...</div>
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "rounded-3xl bg-background/50 border border-primary/10 focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden",
        "backdrop-blur-sm shadow-inner",
        className
      )}
      style={{ minHeight }}
    >
      <EditorContent 
        editor={editor} 
        className="h-full overflow-y-auto scrollbar-hide"
      />
      {/* 底部提示栏 */}
      <div className="px-4 py-2 bg-muted/10 border-t border-border/20 flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
        <div className="flex gap-4">
          <span># 标题</span>
          <span>**粗体**</span>
          <span>- 列表</span>
          <span>&gt; 引用</span>
        </div>
        <div className="uppercase tracking-widest opacity-40">Editor</div>
      </div>
    </div>
  )
}
