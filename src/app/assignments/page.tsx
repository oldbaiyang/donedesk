"use client"

import { useEffect } from "react";
import { useAssignments } from "@/hooks/useAssignments";
import { AssignmentCard } from "@/components/AssignmentCard";

export default function AssignmentsPage() {
  const { assignments, fetchAssignments, fetchSubjects, updateAssignmentStatus } = useAssignments();

  useEffect(() => {
    fetchSubjects();
    fetchAssignments();
  }, [fetchSubjects, fetchAssignments]);

  const toggleStatus = (id: string, current: string) => {
    const newStatus = current === 'completed' ? 'pending' : 'completed';
    updateAssignmentStatus(id, newStatus);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-accent drop-shadow-sm pb-1">
            资料与归档区
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">查看并检索你的所有历史任务和学业存档</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
        {assignments.map(item => (
          <AssignmentCard key={item.id} assignment={item} onToggleStatus={toggleStatus} />
        ))}

        {assignments.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5">
            这里干干净净，暂无任何学业资料沉淀。
          </div>
        )}
      </div>
    </div>
  );
}
