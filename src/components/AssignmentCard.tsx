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
};

export function AssignmentCard({ assignment }: Props) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isCompleted = assignment.status === "completed";
  const dueDate = assignment.due_date ? new Date(assignment.due_date) : null;
  const isOverdue = !isCompleted && dueDate && dueDate < new Date();

  return (
    <>
      <Card 
        onClick={() => setIsDetailOpen(true)}
        className={cn(
          "group relative p-5 transition-all duration-300 ease-out border overflow-hidden cursor-pointer selection:bg-none h-full",
          "hover:shadow-xl hover:-translate-y-1 hover:border-primary/40 bg-card/80 backdrop-blur-sm flex flex-col",
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
        
        <div className="flex gap-4 items-start relative z-10 h-full flex-1">
        <div 
          className={cn("mt-1 shrink-0 transition-all duration-300", 
            isCompleted ? "text-emerald-500 drop-shadow-sm" : "text-muted-foreground drop-shadow-none"
          )}
        >
          {isCompleted ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7 stroke-[1.5]" />}
        </div>

          <div className="flex-1 space-y-2 text-left flex flex-col h-full">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className={cn("font-semibold leading-none", isCompleted && "line-through text-muted-foreground")}>
                  {assignment.title}
                </h3>
                {/* 描述：严格截断并保持高度趋势 */}
                <div className="min-h-[2.5rem]">
                  {assignment.description && (() => {
                    const imgRegex = /!\[.*?\]\((.*?)\)/g;
                    const images: string[] = [];
                    let match;
                    const cleanDesc = assignment.description.replace(/\\(!|\[|\]|\(|\))/g, '$1');
                    
                    while ((match = imgRegex.exec(cleanDesc)) !== null) {
                      images.push(match[1]);
                    }

                    const textOnly = cleanDesc.replace(/!\[.*?\]\(.*?\)/g, '').trim();

                    if (images.length > 0 && textOnly === "") {
                      return (
                        <div className="flex gap-1.5 mt-2 overflow-hidden h-10">
                          {images.slice(0, 3).map((src, i) => (
                            <img 
                              key={i} 
                              src={src} 
                              className="h-full aspect-square object-cover rounded-md border border-border/40 shadow-sm" 
                              alt=""
                            />
                          ))}
                          {images.length > 3 && (
                            <div className="h-full aspect-square rounded-md bg-muted/30 border border-dashed flex items-center justify-center text-[10px] text-muted-foreground whitespace-nowrap px-1">
                              +{images.length - 3}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {textOnly || cleanDesc.replace(/!\[.*?\]\(.*?\)/g, '[图片]')}
                      </p>
                    );
                  })()}
                </div>

                {/* 附件展示模块：精简为单行或角标模式 */}
                {(() => {
                  const materialAtts = assignment.attachments?.filter(a => (a.purpose || 'material') === 'material') || [];
                  if (materialAtts.length === 0) return null;

                  return (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-16 overflow-hidden">
                      {materialAtts.slice(0, 2).map(att => (
                        <a 
                          key={att.id} 
                          href={att.file_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center gap-1 text-[10px] text-primary/80 font-medium hover:underline bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded transition-colors hover:bg-primary/10 max-w-[120px]"
                        >
                          <Paperclip className="w-2.5 h-2.5 shrink-0" /> 
                          <span className="truncate">{att.file_name}</span>
                        </a>
                      ))}
                      {materialAtts.length > 2 && (
                        <div className="flex items-center text-[10px] text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded border border-dashed border-border/50">
                          +{materialAtts.length - 2} 份文件
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              
              {assignment.subject && (
                <Badge variant="outline" style={{ borderColor: assignment.subject.color_code, color: assignment.subject.color_code }}>
                  {assignment.subject.name}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2 mt-auto">
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
