"use client"

import { useState } from "react";
import { Assignment } from "@/hooks/useAssignments";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Calendar, CheckCircle2, Circle, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AssignmentDetailDialog } from "./AssignmentDetailDialog";

type Props = {
  assignment: Assignment;
  onToggleStatus: (id: string, currentStatus: string) => void;
};

export function AssignmentCard({ assignment, onToggleStatus }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isCompleted = assignment.status === "completed";
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isOverdue = !isCompleted && dueDate && dueDate < new Date();

  return (
    <>
      <Card 
        onClick={() => setIsDetailOpen(true)}
        className={cn(
          "group relative p-5 transition-all duration-300 ease-out border overflow-hidden cursor-pointer selection:bg-none",
          "hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 bg-card/80 backdrop-blur-sm",
          isCompleted ? "opacity-60 bg-muted/50 grayscale-[0.2]" : "shadow-sm"
        )}
      >
        {/* 渐变装饰条 */}
        {!isCompleted && !!assignment.subject && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 opacity-80" 
            style={{ backgroundColor: assignment.subject.color_code }} 
          />
        )}
        
        <div className="flex gap-4 items-start relative z-10">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(assignment.id, assignment.status);
            }}
            className={cn("mt-1 shrink-0 transition-all duration-300 hover:scale-125 focus:scale-95", 
              isCompleted ? "text-emerald-500 drop-shadow-sm" : "text-muted-foreground hover:text-primary drop-shadow-none cursor-pointer"
            )}
          >
            {isCompleted ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7 stroke-[1.5]" />}
          </button>

          <div className="flex-1 space-y-2 text-left">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className={cn("font-semibold leading-none", isCompleted && "line-through text-muted-foreground")}>
                  {assignment.title}
                </h3>
                {assignment.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{assignment.description}</p>
                )}
                {/* 附件展示模块 */}
                {!!assignment.attachments?.length && (
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    {assignment.attachments.map(att => (
                      <a key={att.id} href={att.file_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-primary font-medium hover:underline bg-primary/10 border border-primary/20 px-2 py-1 rounded-md transition-colors hover:bg-primary/20">
                        <Paperclip className="w-3 h-3" /> {att.file_name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              {assignment.subject && (
                <Badge variant="outline" style={{ borderColor: assignment.subject.color_code, color: assignment.subject.color_code }}>
                  {assignment.subject.name}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2">
              {dueDate && (
                <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors", isOverdue ? "bg-destructive/10 text-destructive font-bold" : "bg-secondary/50 text-secondary-foreground object-contain")}>
                  <Calendar className="h-3.5 w-3.5" />
                  {isOverdue ? "已逾期 " : "截止 "}{format(dueDate, 'yyyy-MM-dd')}
                </div>
              )}
              
              {assignment.reward_pts > 0 && (
                <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md font-semibold border border-amber-500/20">
                  ⭐ {assignment.reward_pts} 分
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <AssignmentDetailDialog 
        assignment={assignment} 
        open={isDetailOpen} 
        onOpenChange={setIsDetailOpen} 
      />
    </>
  );
}
