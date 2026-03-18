import { Assignment, useAssignments } from "@/hooks/useAssignments"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar as CalendarUI } from "./ui/calendar"
import { Calendar, Paperclip, Star, Info, CheckCircle2, RotateCcw, Loader2, Edit2, Save, X, MessageSquare, Upload, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import dynamic from "next/dynamic"
import { ImageZoom } from "./ImageZoom"
import { useUser } from "@/hooks/useUser"
import { PendingFilePreview } from "./PendingFilePreview"


const MarkdownEditor = dynamic(
  () => import("./MarkdownEditor").then((mod) => mod.MarkdownEditor),
  { 
    ssr: false,
    loading: () => <div className="min-h-[250px] rounded-3xl bg-muted/20 border border-border/40 animate-pulse flex items-center justify-center text-muted-foreground/40 text-sm">加载中...</div>
  }
)

type Props = {
  assignment: Assignment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const cleanMarkdown = (content: string) => {
  if (!content) return "";
  return content.replace(/\\(!|\[|\])/g, '$1').replace(/\\[(]/g, '(').replace(/\\[)]/g, ')');
};

export function AssignmentDetailDialog({ assignment, open, onOpenChange }: Props) {
  const { profile } = useUser();
  const { updateAssignmentStatus, updateAssignment, subjects, uploadAttachment, deleteAttachment, deleteAssignment } = useAssignments();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // 家长编辑任务的数据
  const [editData, setEditData] = useState({
    title: "",
    description: "",
    reward_pts: 0,
    start_date: null as string | null,
    due_date: null as string | null,
    subject_id: ""
  });

  // 学生交作业的数据
  const [studentNotes, setStudentNotes] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const submissionInputRef = useRef<HTMLInputElement>(null);

  // 家长上传资料的数据
  const [pendingMaterialFiles, setPendingMaterialFiles] = useState<File[]>([]);
  const materialInputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!assignment) return null

  const isCompleted = assignment.status === "completed"
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const isParent = profile?.role === 'parent';
  const isStudent = profile?.role === 'student';
  const isCreator = assignment.user_id === profile?.id;
  const canEditMeta = isParent || isCreator;
  const canDelete = isParent || isCreator;
  const canEditSubmission = !isCompleted && (isStudent || isParent);

  useEffect(() => {
    if (assignment) {
      setEditData({
        title: assignment.title,
        description: assignment.description || "",
        reward_pts: assignment.reward_pts,
        start_date: assignment.start_date,
        due_date: assignment.due_date,
        subject_id: assignment.subject_id
      });
      setStudentNotes(assignment.student_notes || "");
      setSubmissionFiles([]);
      setPendingMaterialFiles([]);
      setIsEditing(false);
      setSelectedImage(null);
    }
  }, [assignment]);

  const isImageFile = (fileName: string) => {
    const images = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext ? images.includes(ext) : false;
  };

  // 区分教学资料和学生提交
  const materials = assignment.attachments?.filter(a => a.purpose === 'material') || [];
  const submissions = assignment.attachments?.filter(a => a.purpose === 'submission') || [];
  
  const materialImages = materials.filter(a => isImageFile(a.file_name));
  const materialFiles = materials.filter(a => !isImageFile(a.file_name));
  
  const submissionImages = submissions.filter(a => isImageFile(a.file_name));
  const submissionNonImages = submissions.filter(a => !isImageFile(a.file_name));

  const handleSaveEdit = async () => {
    setLoading(true);
    // 1. 更新基本信息
    await updateAssignment(assignment.id, editData);
    
    // 2. 上传新资料附件
    if (pendingMaterialFiles.length > 0) {
        await Promise.all(pendingMaterialFiles.map(file => uploadAttachment(assignment.id, file, 'material')));
    }
    
    setPendingMaterialFiles([]);
    setIsEditing(false);
    setLoading(false);
  };

  const handleStudentSubmit = async () => {
    setLoading(true);
    // 1. 更新备注
    await updateAssignment(assignment.id, { 
        status: 'completed',
        student_notes: studentNotes,
        completed_at: new Date().toISOString()
    });
    
    // 2. 上传新附件
    if (submissionFiles.length > 0) {
        await Promise.all(submissionFiles.map(file => uploadAttachment(assignment.id, file, 'submission')));
    }
    
    setSubmissionFiles([]);
    setLoading(false);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    // 1. 保存备注（不改变状态）
    await updateAssignment(assignment.id, { 
        student_notes: studentNotes 
    });
    
    // 2. 上传新附件
    if (submissionFiles.length > 0) {
        await Promise.all(submissionFiles.map(file => uploadAttachment(assignment.id, file, 'submission')));
    }
    
    setSubmissionFiles([]);
    setLoading(false);
  };

  const handleRollback = async () => {
    setLoading(true);
    await updateAssignmentStatus(assignment.id, 'in_progress');
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("确定要彻底删除这个作业及其所有附件吗？此操作不可撤销。")) return;
    
    setLoading(true);
    const success = await deleteAssignment(assignment.id, assignment.attachments);
    if (success) {
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!loading) {
            onOpenChange(val);
            if (!val) setIsEditing(false);
        }
    }}>
      <DialogContent className="sm:max-w-4xl bg-card/95 backdrop-blur-3xl border-primary/20 shadow-2xl p-0 overflow-hidden flex flex-col max-h-[min(90vh,900px)]">
        {assignment.subject && (
          <div className="h-1.5 w-full opacity-80 shrink-0" style={{ backgroundColor: assignment.subject.color_code }} />
        )}
        
        <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-8">
          {/* 头部：标题与状态 */}
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-1">任务名称</label>
                    <Input 
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="text-xl font-extrabold bg-background/50 border-primary/20 h-12"
                      placeholder="任务名称..."
                    />
                  </div>
                ) : (
                  <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground/90">
                    {assignment.title}
                  </DialogTitle>
                )}
                
                <div className="flex items-center gap-3 mt-1">
                  {!isEditing && (
                    <>
                      {assignment.subject && (
                        <Badge variant="outline" className="px-3 py-1 text-xs font-bold rounded-full border-2" style={{ borderColor: assignment.subject.color_code, color: assignment.subject.color_code, backgroundColor: `${assignment.subject.color_code}10` }}>
                          {assignment.subject.name}
                        </Badge>
                      )}
                      <Badge variant={isCompleted ? "secondary" : "default"} className={cn("px-3 py-1 text-xs font-bold rounded-full", isCompleted && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                        {isCompleted ? "已完成" : "进行中"}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {canEditMeta && !isCompleted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-xl transition-all shrink-0", isEditing ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary/10 text-primary hover:bg-primary/20")}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                >
                  {isEditing ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* 任务详情区 (Parent Area) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <div className="w-1 h-4 bg-primary rounded-full" />
                任务详情
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="space-y-1.5 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 truncate">关联学科</p>
                  {isEditing ? (
                    <Select value={editData.subject_id} onValueChange={(val) => setEditData({...editData, subject_id: val as string})}>
                       <SelectTrigger className="w-full h-9 px-3 text-xs bg-background/50 border-primary/10 transition-all">
                         <SelectValue placeholder="选择学科" />
                       </SelectTrigger>
                       <SelectContent>
                         {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm font-bold text-foreground/80 truncate">{assignment.subject?.name || "未分类"}</p>
                  )}
                </div>
                <div className="space-y-1.5 overflow-hidden">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 truncate">奖励积分</p>
                  {isEditing ? (
                    <Input type="number" value={editData.reward_pts} onChange={(e) => setEditData({...editData, reward_pts: parseInt(e.target.value) || 0})} className="w-full h-9 px-3 text-xs font-bold text-amber-500 bg-background/50 border-amber-500/20" />
                  ) : (
                    <p className="text-sm font-bold text-amber-500">{assignment.reward_pts} PTs</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-background border border-border/50 shadow-sm">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> 开始</p>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger className="w-full"><div className="h-8 px-2 text-[11px] border rounded flex items-center bg-muted/20">{editData.start_date ? format(new Date(editData.start_date), "MM-dd") : "设置"}</div></PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><CalendarUI mode="single" selected={editData.start_date ? new Date(editData.start_date) : undefined} onSelect={(d) => setEditData({...editData, start_date: d ? d.toISOString() : null})} initialFocus /></PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm font-semibold text-foreground/70">{assignment.start_date ? format(new Date(assignment.start_date), 'MM月dd日') : "立即"}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1"><Calendar className="w-3 h-3 text-amber-500" /> 截止</p>
                  {isEditing ? (
                    <Popover>
                      <PopoverTrigger className="w-full"><div className="h-8 px-2 text-[11px] border rounded flex items-center bg-muted/20">{editData.due_date ? format(new Date(editData.due_date), "MM-dd") : "设置"}</div></PopoverTrigger>
                      <PopoverContent className="w-auto p-0"><CalendarUI mode="single" selected={editData.due_date ? new Date(editData.due_date) : undefined} onSelect={(d) => setEditData({...editData, due_date: d ? d.toISOString() : null})} initialFocus /></PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm font-semibold text-foreground/70">{dueDate ? format(dueDate, 'MM月dd日') : "未设置"}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing ? (
              <MarkdownEditor value={editData.description} onChange={(val: string) => setEditData({...editData, description: val})} minHeight="250px" />
            ) : (
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 min-h-[120px]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                  <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{
                    p: ({ children }) => <div className="mb-4 last:mb-0">{children}</div>,
                    img: ({ ...props }) => <ImageZoom src={(props.src as string) || ""} alt={props.alt || ""} className="rounded-xl border border-border/40 shadow-sm w-[200px] h-[200px] object-cover !inline-block mr-4 mb-4" />,
                  }}>
                    {cleanMarkdown(assignment.description || "暂无具体详情描述。")}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* 资料附件展示与编辑 */}
            {isEditing ? (
                <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 pl-1 flex items-center gap-1"><Paperclip className="w-3 h-3" /> 任务资料/要求附件 (编辑中)</p>
                    
                    {/* 已有的资料显示删除按钮 */}
                    {(materialImages.length > 0 || materialFiles.length > 0) && (
                        <div className="space-y-3 p-3 rounded-2xl bg-primary/5 border border-primary/10">
                            {materialImages.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {materialImages.map(img => (
                                        <div key={img.id} className="relative group">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted/20">
                                                <img src={img.file_url} className="w-full h-full object-cover" alt="资料" />
                                            </div>
                                            <button onClick={() => deleteAttachment(img.id, img.file_url)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {materialFiles.length > 0 && (
                                <div className="grid grid-cols-1 gap-2">
                                    {materialFiles.map(att => (
                                        <div key={att.id} className="flex items-center gap-2 p-2 rounded-xl bg-card border group">
                                            <Paperclip className="w-3 h-3 text-primary shrink-0" />
                                            <span className="text-[10px] font-medium truncate flex-1">{att.file_name}</span>
                                            <button onClick={() => deleteAttachment(att.id, att.file_url)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-lg"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {pendingMaterialFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {pendingMaterialFiles.map((f, i) => (
                                <PendingFilePreview 
                                    key={i} 
                                    file={f} 
                                    onRemove={() => setPendingMaterialFiles(pendingMaterialFiles.filter((_, idx) => idx !== i))} 
                                    colorClass="primary"
                                />
                            ))}
                        </div>
                    )}
                    <input ref={materialInputRef} type="file" multiple className="hidden" onChange={(e) => { if (e.target.files) { setPendingMaterialFiles([...pendingMaterialFiles, ...Array.from(e.target.files)]); } e.target.value = ''; }} />
                    <Button variant="outline" className="w-full border-dashed border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 rounded-2xl h-14 font-bold text-primary" onClick={() => materialInputRef.current?.click()}>
                        <Upload className="w-5 h-5 mr-2" /> 上传任务补充资料 ({pendingMaterialFiles.length})
                    </Button>
                </div>
            ) : materials.length > 0 ? (
                <div className="space-y-4">
                    {materialImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {materialImages.map(img => (
                                <button key={img.id} onClick={() => setSelectedImage(img.file_url)} className="aspect-square rounded-2xl overflow-hidden border bg-muted/20 hover:border-primary/40 transition-all group relative">
                                    <img src={img.file_url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={img.file_name} />
                                </button>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {materialFiles.map(att => (
                            <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-2xl bg-card border hover:border-primary/40 transition-all group">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0"><Paperclip className="w-4 h-4" /></div>
                                <span className="text-xs font-medium truncate flex-1 text-foreground/70">{att.file_name}</span>
                            </a>
                        ))}
                    </div>
                </div>
            ) : null}
          </div>

          <div className="h-px bg-border/40 w-full" />

          {/* 交作业区 (Student Area) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                交作业区
            </div>

            <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground/70 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-500" /> 学生备注
                    </h4>
                    {canEditSubmission ? (
                        <Textarea 
                            value={studentNotes}
                            onChange={(e) => setStudentNotes(e.target.value)}
                            placeholder="在这里写下你的学习心得或作业说明..."
                            className="bg-background/50 border-indigo-500/10 focus-visible:ring-indigo-500/30 rounded-2xl min-h-[100px] text-sm"
                        />
                    ) : (
                        <div className="p-4 rounded-2xl bg-background/40 border border-border/40 text-sm text-foreground/80 italic">
                            {assignment.student_notes || "暂无学生备注。"}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h4 className="text-xs font-bold text-foreground/70 flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-indigo-500" /> 作业成果
                    </h4>
                    
                    {/* 已提交的作业成果图片 */}
                    {submissionImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-3">
                            {submissionImages.map(img => (
                                <div key={img.id} className="relative aspect-square">
                                    <button onClick={() => setSelectedImage(img.file_url)} className="w-full h-full rounded-2xl overflow-hidden border-2 border-indigo-500/20 bg-muted/20 hover:border-indigo-500/40 transition-all group relative">
                                        <img src={img.file_url} className="w-full h-full object-cover" alt="成果" />
                                        <Badge className="absolute top-1 right-1 h-4 px-1 text-[8px] bg-indigo-500">已提交</Badge>
                                    </button>
                                    {canEditSubmission && (
                                        <button onClick={() => deleteAttachment(img.id, img.file_url)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform z-10"><X className="w-3 h-3" /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 已提交的非图片成果 */}
                    {submissionNonImages.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {submissionNonImages.map(att => (
                                <div key={att.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-indigo-500/10 hover:border-indigo-500/40 transition-all group">
                                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors shrink-0"><Paperclip className="w-4 h-4" /></div>
                                    <div className="flex-1 min-w-0">
                                        <a href={att.file_url} target="_blank" rel="noreferrer" className="text-xs font-medium truncate block text-foreground/70 mb-0.5">{att.file_name}</a>
                                        <Badge variant="outline" className="h-4 px-1 text-[8px] bg-indigo-500/5 text-indigo-500 border-indigo-500/20">已提交</Badge>
                                    </div>
                                    {canEditSubmission && (
                                        <button onClick={() => deleteAttachment(att.id, att.file_url)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/10 rounded-lg"><X className="w-3 h-3" /></button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 学生上传区域 */}
                    {canEditSubmission && (
                        <div className="space-y-4">
                            {submissionFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {submissionFiles.map((f, i) => (
                                        <PendingFilePreview 
                                            key={i} 
                                            file={f} 
                                            onRemove={() => setSubmissionFiles(submissionFiles.filter((_, idx) => idx !== i))} 
                                            colorClass="indigo"
                                        />
                                    ))}
                                </div>
                            )}
                            <input ref={submissionInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => { if (e.target.files) { setSubmissionFiles([...submissionFiles, ...Array.from(e.target.files)]); } e.target.value = ''; }} />
                            <Button variant="outline" className="w-full border-dashed border-2 border-indigo-500/20 hover:bg-indigo-500/10 hover:border-indigo-500/40 rounded-2xl h-14 font-bold text-indigo-500" onClick={() => submissionInputRef.current?.click()}>
                                <Upload className="w-5 h-5 mr-2" /> 上传作业照片成果 ({submissionFiles.length})
                            </Button>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* 底部操作固定栏 */}
        <div className="p-6 bg-muted/50 border-t backdrop-blur-sm flex items-center justify-center gap-4 shrink-0">
          {isEditing ? (
            <div className="flex items-center gap-3 w-full max-w-lg">
                {canDelete && (
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0" onClick={handleDelete} disabled={loading} title="删除任务">
                      <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <div className="flex gap-3 flex-1">
                    <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-2" onClick={() => setIsEditing(false)} disabled={loading}>取消修改</Button>
                    <Button className="flex-[2] h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/25" onClick={handleSaveEdit} disabled={loading}>{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> 保存变更</>}</Button>
                </div>
            </div>
          ) : canEditSubmission ? (
            <div className="flex items-center gap-3 w-full max-w-lg">
                {canDelete && (
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0" onClick={handleDelete} disabled={loading} title="删除任务">
                      <Trash2 className="w-5 h-5" />
                  </Button>
                )}
                <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-2 border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/10" onClick={handleSaveDraft} disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> 保存草稿</>}
                </Button>
                <Button className="flex-[1.5] h-12 rounded-2xl font-bold text-base bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25" onClick={handleStudentSubmit} disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5 mr-2" /> 提交并完成</>}
                </Button>
            </div>
          ) : isCompleted ? (
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                    {canDelete && (
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete} disabled={loading} title="删除任务">
                          <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="outline" className="h-10 rounded-xl px-6 border-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 border-transparent transition-all" onClick={handleRollback} disabled={loading}>
                        <RotateCcw className="w-4 h-4 mr-2" /> 撤销完成状态
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic font-medium">任务已于 {assignment.completed_at ? format(new Date(assignment.completed_at), 'yyyy-MM-dd HH:mm') : '未知时间'} 完成</p>
            </div>
          ) : (
              <div className="text-sm font-bold text-muted-foreground flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> 任务进行中，等待学生提交...
              </div>
          )}
        </div>

        {/* 图片灯箱 */}
        {selectedImage && (
          <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
            <div className="relative max-w-full max-h-full">
              <img src={selectedImage} alt="Preview" className="rounded-3xl shadow-2xl ring-1 ring-white/20 max-h-[85vh] object-contain animate-in zoom-in-95 duration-300" />
              <Button variant="outline" size="icon" className="absolute -top-4 -right-4 rounded-full bg-background/90 shadow-xl border-2" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}><X className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
