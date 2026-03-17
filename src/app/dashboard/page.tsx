"use client"

import { useEffect, useState } from "react";
import { useAssignments } from "@/hooks/useAssignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { CreateAssignmentDialog } from "@/components/CreateAssignmentDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const { assignments, fetchAssignments, fetchSubjects, updateAssignmentStatus } = useAssignments();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  
  // 组件挂载时获取数据
  useEffect(() => {
    fetchSubjects();
    fetchAssignments();
  }, [fetchSubjects, fetchAssignments]);

  const toggleStatus = (id: string, current: string) => {
    const newStatus = current === 'completed' ? 'pending' : 'completed';
    updateAssignmentStatus(id, newStatus);
  };

  const pendingAssignments = assignments.filter(a => a.status !== 'completed');
  const completedAssignments = assignments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-accent drop-shadow-sm pb-1">
            我的工作台
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            今天你有 <span className="text-primary font-bold px-1">{pendingAssignments.length}</span> 个任务待处理。
          </p>
        </div>
        <div className="group cursor-pointer relative" onClick={() => setIsCreateOpen(true)}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95">
            <Plus className="mr-2 h-5 w-5" /> 新建作业
          </div>
        </div>
      </div>

      {pendingAssignments.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            进行中 <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">{pendingAssignments.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAssignments.map(item => (
              <AssignmentCard key={item.id} assignment={item} onToggleStatus={toggleStatus} />
            ))}
          </div>
        </section>
      )}

      {completedAssignments.length > 0 && (
        <section className="space-y-4 mt-12 relative">
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none -z-10" />
           <h2 className="text-xl font-bold text-muted-foreground/60 flex items-center gap-2">
             <div className="h-px bg-border flex-1"></div>
             已完成历史
             <div className="h-px bg-border flex-1"></div>
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-80 hover:opacity-100 transition-opacity duration-500">
            {completedAssignments.map(item => (
              <AssignmentCard key={item.id} assignment={item} onToggleStatus={toggleStatus} />
            ))}
          </div>
        </section>
      )}

      {assignments.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5 hover:bg-primary/10 transition-colors duration-500 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://api.typedream.com/v0/document/public/8c34614a-5c2f-4886-abe8-06ccfbf9a63c/r4m4p8H2XvL7C70Hpwl8Xg8W06H.svg')] opacity-[0.2] bg-[length:24px_24px] pointer-events-none" />
          <div className="w-20 h-20 bg-background shadow-xl rounded-2xl flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
            <Plus className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-muted-foreground relative z-10">一切准备就绪</h3>
          <p className="text-base text-muted-foreground max-w-sm mt-3 mb-8 relative z-10">
            系统已完成初始化。点击下方按钮，立刻为你的学业建立第一份超酷的结构化防遗忘作业！
          </p>
          <div className="relative inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 py-2 text-base font-bold text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 cursor-pointer z-10" onClick={() => setIsCreateOpen(true)}>
            立即施展魔法
          </div>
        </div>
      )}

      <CreateAssignmentDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
