import { Assignment, useAssignments } from "@/hooks/useAssignments"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, Paperclip, Star, Info, CheckCircle2, RotateCcw, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState } from "react"

type Props = {
  assignment: Assignment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignmentDetailDialog({ assignment, open, onOpenChange }: Props) {
  const { updateAssignmentStatus } = useAssignments();
  const [loading, setLoading] = useState(false);

  if (!assignment) return null

  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
  const isCompleted = assignment.status === "completed"

  const handleToggleStatus = async () => {
    setLoading(true);
    const newStatus = isCompleted ? 'in_progress' : 'completed';
    await updateAssignmentStatus(assignment.id, newStatus);
    setLoading(false);
    // 可选：完成时自动关闭弹窗
    // if (newStatus === 'completed') onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-3xl border-primary/20 shadow-2xl p-0">
        {/* 顶部彩色装饰条 */}
        {assignment.subject && (
          <div 
            className="h-1.5 w-full opacity-80" 
            style={{ backgroundColor: assignment.subject.color_code }} 
          />
        )}
        
        <div className="p-8 space-y-8">
          <DialogHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <DialogTitle className="text-3xl font-extrabold tracking-tight text-foreground/90">
                  {assignment.title}
                </DialogTitle>
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
               <div>
                 <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">奖励积分 / Rewards</p>
                 <p className="text-sm font-bold text-amber-500">
                   {assignment.reward_pts} Points
                 </p>
               </div>
             </div>
          </div>

          {/* 作业详情内容区域 */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2 text-foreground/70">
              <Info className="w-4 h-4 text-primary" /> 作业详情内容
            </h4>
            <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 text-base leading-relaxed text-foreground/80 whitespace-pre-wrap min-h-[120px]">
              {assignment.description || "暂无具体详情描述。"}
            </div>
          </div>

          {/* 附件资料下载区 */}
          {!!assignment.attachments?.length && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2 text-foreground/70">
                <Paperclip className="w-4 h-4 text-primary" /> 关联学习资料 ({assignment.attachments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {assignment.attachments.map(att => (
                  <a 
                    key={att.id} 
                    href={att.file_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-3 p-4 rounded-2xl bg-card border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group overflow-hidden"
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
          
          <div className="pt-2 text-[10px] text-center text-muted-foreground/40 font-medium italic">
            记得在完成后回来打钩，领取你的积分奖牌！
          </div>
        </div>

        {/* 底部操作固定栏 */}
        <div className="p-6 bg-muted/50 border-t backdrop-blur-sm flex items-center justify-center gap-3">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
