"use client"

import { useState, useEffect } from "react"
import { useAssignments } from "@/hooks/useAssignments"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { CalendarIcon, Loader2, Plus, Paperclip, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"
import { PendingFilePreview } from "./PendingFilePreview"

const MarkdownEditor = dynamic(
  () => import("./MarkdownEditor").then((mod) => mod.MarkdownEditor),
  { 
    ssr: false,
    loading: () => <div className="min-h-[250px] rounded-3xl bg-muted/20 border border-border/40 animate-pulse flex items-center justify-center text-muted-foreground/40 text-sm">加载融合编辑器...</div>
  }
)

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAssignmentDialog({ open, onOpenChange }: Props) {
  const { subjects, addSubject, addAssignment, fetchSubjects, uploadAttachment } = useAssignments()

  const [loading, setLoading] = useState(false)
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")

  // 同步初始化拉取最新列表
  useEffect(() => {
    if (open) {
      fetchSubjects()
    }
  }, [open, fetchSubjects])

  // Form State
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [subjectId, setSubjectId] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [date, setDate] = useState<Date>(new Date()) // 截止日期
  const [pts, setPts] = useState("10")
  const [files, setFiles] = useState<File[]>([])

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return
    setLoading(true)
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
    const newSubject = await addSubject(newSubjectName, randomColor)

    // 如果新建成功，直接替用户选中刚新建的新学科
    if (newSubject) {
      setSubjectId(newSubject.id)
    }

    setNewSubjectName("")
    setIsAddingSubject(false)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !subjectId) return
    setLoading(true)

    // 1. 先创建作业基础记录
    const newAssignment = await addAssignment({
      title,
      description: desc || null,
      subject_id: subjectId,
      start_date: startDate ? startDate.toISOString() : null,
      due_date: date ? date.toISOString() : null,
      reward_pts: parseInt(pts) || 10,
      status: 'pending'
    })

    // 2. 作业建立成功后，如果有文件附件，则异步并发上传到云端 Storage 并写入关系表
    if (newAssignment && files.length > 0) {
      await Promise.all(files.map(file => uploadAttachment(newAssignment.id, file)));
    }

    onOpenChange(false)
    setLoading(false)
    // Clear forms
    setTitle(""); setDesc(""); setSubjectId(""); 
    setStartDate(new Date()); setDate(new Date()); 
    setPts("10"); setFiles([]);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files as FileList)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 flex flex-col max-h-[min(90vh,900px)] overflow-hidden">
        <div className="p-6 pb-0 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">新建作业 / 任务</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pt-2 space-y-6">
          <div className="space-y-4">
            {/* 任务标题：全宽 */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground/70">任务标题</Label>
              <Input
                placeholder="例如：完成数学期中模拟卷"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="h-12 bg-background/50 border-primary/10 focus-visible:ring-primary/20 text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 学科与积分：并排 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground/70">学科</Label>
                  {!isAddingSubject ? (
                    <div className="flex gap-2">
                      <Select value={subjectId} onValueChange={(val) => setSubjectId(val as string)} required>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择学科">
                            {subjectId && subjects.find(s => s.id === subjectId) ? (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: subjects.find(s => s.id === subjectId)?.color_code }} />
                                <span className="truncate">{subjects.find(s => s.id === subjectId)?.name}</span>
                              </div>
                            ) : "请选择"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(s => (
                            <SelectItem key={s.id} value={s.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: s.color_code }} />
                                {s.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingSubject(true)} className="shrink-0" title="新增学科">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="名称"
                        value={newSubjectName}
                        onChange={e => setNewSubjectName(e.target.value)}
                        autoFocus
                        className="h-10 px-2"
                      />
                      <Button type="button" size="sm" onClick={handleCreateSubject} disabled={loading}>
                        确定
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingSubject(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground/70">奖励积分</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    value={pts} 
                    onChange={e => setPts(e.target.value)}
                    className="h-10 bg-background/50 border-primary/10" 
                  />
                </div>
              </div>

              {/* 开始与截止日期：并排 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground/70">开始日期</Label>
                  <Popover>
                    <PopoverTrigger className="w-full">
                      <div className="flex px-3 items-center justify-start h-10 w-full text-sm border rounded-md bg-background/50 border-primary/10 hover:bg-accent transition-colors cursor-pointer">
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        <span className="truncate">{startDate ? format(startDate, "MM-dd") : "开始"}</span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={(val) => val && setStartDate(val)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-foreground/70">截止日期</Label>
                  <Popover>
                    <PopoverTrigger className="w-full">
                      <div className="flex px-3 items-center justify-start h-10 w-full text-sm border rounded-md bg-background/50 border-primary/10 hover:bg-accent transition-colors cursor-pointer">
                        <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                        <span className="truncate">{date ? format(date, "MM-dd") : "截止"}</span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={(val) => val && setDate(val)} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* 作业详情 (融合编辑器模式) */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground/70">作业详情 (Obsidian 融合预览模式)</Label>
            <MarkdownEditor 
              value={desc} 
              onChange={setDesc} 
              minHeight="250px"
              className="mt-1"
            />
          </div>

          {/* 上传资料附件：放在详情下方 */}
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-foreground/70">关联参考资料附件</Label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center w-full h-11 px-4 transition bg-background/30 border-2 border-dashed rounded-2xl appearance-none cursor-pointer hover:border-primary/50 focus:outline-none group">
                <span className="flex items-center space-x-2">
                  <Paperclip className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium text-muted-foreground text-sm group-hover:text-primary transition-colors">点击上传图片、PDF 或其他学习资料</span>
                </span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((file, idx) => (
                    <PendingFilePreview 
                      key={idx} 
                      file={file} 
                      onRemove={() => removeFile(idx)} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !title || !subjectId}>
            {loading ? "正在保存..." : "建立任务"}
          </Button>
        </form>

      </DialogContent>
    </Dialog>
  )
}
