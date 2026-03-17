import { Assignment, useAssignments } from "@/hooks/useAssignments"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Calendar, Paperclip, Star, Info, CheckCircle2, RotateCcw, Loader2, Edit2, Save, X, Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"

type Props = {
  assignment: Assignment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignmentDetailDialog({ assignment, open, onOpenChange }: Props) {
  const { updateAssignmentStatus, updateAssignment } = useAssignments();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editData, setEditData] = useState<{
    title: string;
    description: string;
    reward_pts: number;
  }>({
    title: "",
    description: "",
    reward_pts: 0
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 当作业变更时同步编辑数据
  useEffect(() => {
    if (assignment) {
      setEditData({
        title: assignment.title,
        description: assignment.description || "",
        reward_pts: assignment.reward_pts
      });
      setIsEditing(false); // 每次切换作业时默认关闭编辑模式
      setSelectedImage(null);
    }
  }, [assignment]);

  if (!assignment) return null

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const isCompleted = assignment.status === "completed"

  // 辅助函数：判断是否为图片
  const isImageFile = (fileName: string) => {
    const images = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext ? images.includes(ext) : false;
  };

  const images = assignment.attachments?.filter(a => isImageFile(a.file_name)) || [];
  const otherFiles = assignment.attachments?.filter(a => !isImageFile(a.file_name)) || [];

  const handleToggleStatus = async () => {
    setLoading(true);
    const newStatus = isCompleted ? 'in_progress' : 'completed';
    await updateAssignmentStatus(assignment.id, newStatus);
    setLoading(false);
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    await updateAssignment(assignment.id, {
      title: editData.title,
      description: editData.description,
      reward_pts: editData.reward_pts
    });
    setIsEditing(false);
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
        {/* 顶部彩色装饰条 */}
        {assignment.subject && (
          <div 
            className="h-1.5 w-full opacity-80 shrink-0" 
            style={{ backgroundColor: assignment.subject.color_code }} 
          />
        )}
        
        <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-6">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                {isEditing ? (
                  <div className="space-y-2 pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">作业标题</label>
                    <Input 
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="text-xl font-bold bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                      placeholder="输入作业标题..."
                    />
                  </div>
                ) : (
                  <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground/90">
                    {assignment.title}
                  </DialogTitle>
                )}
                
                <div className="flex items-center gap-3">
                  {assignment.subject && (
                    <Badge 
                      variant="outline" 
                      className="px-3 py-1 text-xs font-bold rounded-full border-2 transition-transform hover:scale-105"
                      style={{ 
                        borderColor: assignment.subject.color_code, 
                        color: assignment.subject.color_code,
                        backgroundColor: `${assignment.subject.color_code}10`
                      }}
                    >
                      {assignment.subject.name}
                    </Badge>
                  )}
                  <Badge variant={isCompleted ? "secondary" : "default"} className={cn("px-3 py-1 text-xs font-bold rounded-full", isCompleted && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                    {isCompleted ? "已完成" : "进行中"}
                  </Badge>
                </div>
              </div>
              
              {!isCompleted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "rounded-xl transition-all",
                    isEditing ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                >
                  {isEditing ? <X className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* 核心信息网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-primary/5 border border-primary/10">
             <div className="flex items-center gap-4 group">
               <div className="p-3 rounded-2xl bg-background shadow-sm border group-hover:bg-primary/5 transition-colors">
                 <Calendar className="h-6 w-6 text-primary" />
               </div>
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">截止时间 / Deadline</p>
                 <p className="text-sm font-semibold text-foreground/80">
                   {dueDate ? format(dueDate, 'yyyy年MM月dd日') : "未设置"}
                 </p>
               </div>
             </div>

             <div className="flex items-center gap-4 group">
               <div className="p-3 rounded-2xl bg-background shadow-sm border group-hover:bg-amber-500/5 transition-colors">
                 <Star className="h-6 w-6 text-amber-500" />
               </div>
               <div className="flex-1">
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">奖励积分 / Rewards</p>
                 {isEditing ? (
                   <Input 
                     type="number"
                     value={editData.reward_pts}
                     onChange={(e) => setEditData({...editData, reward_pts: parseInt(e.target.value) || 0})}
                     className="h-8 py-0.5 text-sm font-bold text-amber-500 bg-background/50 border-amber-500/20 w-24 mt-0.5"
                   />
                 ) : (
                   <p className="text-sm font-bold text-amber-500">
                     {assignment.reward_pts} Points
                   </p>
                 )}
               </div>
             </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-foreground/70">
              <Info className="w-4 h-4 text-primary" /> 作业详情内容 {isEditing && "(Obsidian 实时预览模式)"}
            </h4>

            {isEditing ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider pl-1">
                    <Edit2 className="w-3 h-3" /> 编辑源码
                  </div>
                  <Textarea 
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="p-6 rounded-3xl bg-background/50 border border-primary/20 text-base leading-relaxed text-foreground/80 min-h-[250px] lg:min-h-[300px] focus-visible:ring-primary/30 font-mono resize-none overflow-y-auto"
                    placeholder="支持 Markdown 格式..."
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider pl-1">
                    <Eye className="w-3 h-3" /> 实时预览效果
                  </div>
                  <div className="p-8 rounded-3xl bg-muted/20 border border-border/40 min-h-[250px] lg:min-h-[300px] overflow-y-auto backdrop-blur-sm">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                      <ReactMarkdown>{editData.description || "新内容将在此实时排版展示..."}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 min-h-[120px]">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/80">
                  <ReactMarkdown>{assignment.description || "暂无具体详情描述。"}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>

          {/* 附件资料区：区分图片与常规文档 */}
          {!isEditing && !!assignment.attachments?.length && (
            <div className="space-y-6 pb-2">
              {/* 图片网格预览 */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
                    参考图片资料 ({images.length})
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map(image => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.file_url)}
                        className="aspect-square rounded-2xl overflow-hidden border border-border/50 bg-muted/20 hover:border-primary/40 hover:shadow-lg transition-all active:scale-95 group relative"
                      >
                        <img 
                          src={image.file_url} 
                          alt={image.file_name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 其他文件下载列表 */}
              {otherFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-2">
                    文档及其他附件 ({otherFiles.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherFiles.map(att => (
                      <a 
                        key={att.id} 
                        href={att.file_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border hover:border-primary/40 hover:shadow-md transition-all group overflow-hidden"
                      >
                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium truncate flex-1 text-foreground/70 group-hover:text-primary transition-colors">
                          {att.file_name}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!isEditing && (
            <div className="pt-2 text-[10px] text-center text-muted-foreground/40 font-medium italic">
              记得在完成后回来打钩，领取你的积分奖牌！
            </div>
          )}
        </div>

        {/* 图片全屏预览蒙层 (灯箱) */}
        {selectedImage && (
          <div 
            className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img 
                src={selectedImage} 
                alt="Full Preview" 
                className="rounded-3xl shadow-2xl ring-1 ring-white/20 max-h-[85vh] object-contain animate-in zoom-in-95 duration-300"
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute -top-4 -right-4 rounded-full bg-background/80 backdrop-blur-md shadow-xl border-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 底部操作固定栏 */}
        <div className="p-6 bg-muted/50 border-t backdrop-blur-sm flex items-center justify-center gap-4 shrink-0">
          {isEditing ? (
            <>
              <Button 
                variant="outline"
                className="flex-1 h-12 rounded-2xl font-bold border-2"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                取消修改
              </Button>
              <Button 
                className="flex-[2] h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/25"
                onClick={handleSaveEdit}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> 保存变更内容</>}
              </Button>
            </>
          ) : (
            <Button 
              disabled={loading}
              onClick={handleToggleStatus}
              className={cn(
                "w-full max-w-sm h-12 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-lg",
                isCompleted 
                  ? "bg-slate-200 text-slate-500 hover:bg-slate-300 shadow-none border border-slate-300" 
                  : "bg-primary text-primary-foreground hover:shadow-primary/25"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isCompleted ? (
                <>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  撤回并标记为进行中
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  确认作业已完成
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
