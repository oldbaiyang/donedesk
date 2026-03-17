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
import { CalendarIcon, Loader2, Plus, Paperclip, X, Pencil, Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAssignmentDialog({ open, onOpenChange }: Props) {
  const { subjects, addSubject, addAssignment, fetchSubjects, uploadAttachment } = useAssignments()

  const [loading, setLoading] = useState(false)
  const [isAddingSubject, setIsAddingSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [showPreview, setShowPreview] = useState(false)

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
  const [date, setDate] = useState<Date>()
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
    setTitle(""); setDesc(""); setSubjectId(""); setDate(undefined); setPts("10"); setFiles([]);
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
      <DialogContent className="sm:max-w-2xl p-0 flex flex-col max-h-[min(90vh,800px)] overflow-hidden">
        <div className="p-6 pb-0 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">新建作业 / 任务</DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pt-2 space-y-4">
          <div className="space-y-2">
            <Label>任务标题</Label>
            <Input
              placeholder=""
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>学科</Label>
            {!isAddingSubject ? (
              <div className="flex gap-2">
                <Select value={subjectId} onValueChange={(val) => setSubjectId(val as string)} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="点击选择学科">
                      {subjectId && subjects.find(s => s.id === subjectId) ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: subjects.find(s => s.id === subjectId)?.color_code }} />
                          {subjects.find(s => s.id === subjectId)?.name}
                        </div>
                      ) : "点击选择学科"}
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
                <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingSubject(true)} title="新增学科">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="输入新学科名称..."
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  autoFocus
                />
                <Button type="button" onClick={handleCreateSubject} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "确定"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsAddingSubject(false)}>
                  取消
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>截止日期 (Deadline)</Label>
            <Popover>
              <PopoverTrigger>
                <div
                  className={cn(
                    "flex px-3 items-center justify-start h-11 w-full text-sm font-medium border rounded-md bg-background hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "yyyy-MM-dd") : <span>预定完成的日期</span>}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-foreground/70">作业详情</Label>
              <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 shrink-0">
                <button 
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg transition-all", 
                    !showPreview ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Pencil className="w-3 h-3" /> 编辑
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg transition-all", 
                    showPreview ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Eye className="w-3 h-3" /> 预览
                </button>
              </div>
            </div>

            {showPreview ? (
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 min-h-[150px]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                  <ReactMarkdown>{desc || "暂无预览内容。写入 Markdown 格式以查看排版效果..."}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <Textarea
                placeholder="支持 Markdown 格式，例如：
# 核心要求
- 完成习题 1-5
- 复习第三章 **重点内容**"
                className="min-h-[150px] resize-none font-mono p-6 rounded-3xl bg-background/50 border-primary/10 focus-visible:ring-primary/20"
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-2">
            <Label>上传资料附件</Label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center justify-center w-full h-11 px-4 transition bg-background border-2 border-dashed rounded-md appearance-none cursor-pointer hover:border-primary/50 focus:outline-none">
                <span className="flex items-center space-x-2">
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-sm">
                    点击选择 PDF、图片等参考资料
                  </span>
                </span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {files.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 text-sm bg-muted/50 rounded-md border text-muted-foreground">
                      <span className="truncate max-w-[280px]">{file.name}</span>
                      <button type="button" onClick={() => removeFile(idx)} className="text-destructive hover:bg-destructive/10 p-1 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>完成该任务可获得积分</Label>
            <Input type="number" min="0" value={pts} onChange={e => setPts(e.target.value)} />
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading || !title || !subjectId}>
            {loading ? "正在保存..." : "建立任务"}
          </Button>
        </form>

      </DialogContent>
    </Dialog>
  )
}
