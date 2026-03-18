"use client"

import { useEffect, useState, useMemo } from "react";
import { useAssignments } from "@/hooks/useAssignments";
import { AssignmentCard } from "@/components/AssignmentCard";
import { cn } from "@/lib/utils";

export default function AssignmentsPage() {
  const { assignments, fetchAssignments, fetchSubjects, subjects, loading } = useAssignments();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubjects();
    fetchAssignments();
  }, [fetchSubjects, fetchAssignments]);

  const filteredAssignments = useMemo(() => {
    if (!selectedSubjectId) return assignments;
    return assignments.filter(a => a.subject_id === selectedSubjectId);
  }, [assignments, selectedSubjectId]);

  if (loading && assignments.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-muted rounded-xl" />
          <div className="h-4 w-48 bg-muted rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-muted/20 rounded-3xl border-2 border-muted/20" />
          ))}
        </div>
      </div>
    );
  }

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

      {/* 学科筛选器 */}
      <div className="flex flex-wrap gap-2 pb-2">
        <button
          onClick={() => setSelectedSubjectId(null)}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border-2",
            !selectedSubjectId 
              ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
              : "bg-background text-muted-foreground border-muted hover:border-primary/40 hover:text-primary"
          )}
        >
          全部
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubjectId(subject.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 border-2",
              selectedSubjectId === subject.id
                ? "shadow-md scale-105"
                : "bg-background text-muted-foreground border-muted hover:border-primary/40"
            )}
            style={{
              backgroundColor: selectedSubjectId === subject.id ? subject.color_code : undefined,
              borderColor: selectedSubjectId === subject.id ? subject.color_code : undefined,
              color: selectedSubjectId === subject.id ? '#fff' : undefined,
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-4">
        {filteredAssignments.map(item => (
          <AssignmentCard key={item.id} assignment={item} />
        ))}

        {!loading && filteredAssignments.length === 0 && (
          <div className="col-span-full text-center py-20 text-muted-foreground border-2 border-dashed border-primary/20 rounded-3xl bg-primary/5">
            这里干干净净，暂无任何学业资料沉淀。
          </div>
        )}
      </div>
    </div>
  );
}
