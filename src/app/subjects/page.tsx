"use client"

import { useEffect, useState } from "react";
import { useAssignments, Subject } from "@/hooks/useAssignments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Palette, Trash2, Edit2, Check, X, Plus } from "lucide-react";

export default function SubjectsPage() {
  const { subjects, loading, fetchSubjects, updateSubject, deleteSubject, addSubject } = useAssignments();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6"); // Default blue

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditColor(subject.color_code);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditColor("");
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateSubject(id, { name: editName.trim(), color_code: editColor });
    setEditingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要删除《${name}》吗？这将会同时删除此学科下的所有作业记录！`)) {
      await deleteSubject(id);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addSubject(newName.trim(), newColor);
    setIsAdding(false);
    setNewName("");
    setNewColor("#3b82f6");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
          <BookOpen className="w-8 h-8" /> 学科管理
        </h1>
        <p className="text-muted-foreground mt-1">添加新科目，修改学科颜色，或清理不再需要的学科及其沉淀。</p>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg flex items-center gap-2">全量学科列表 <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{subjects.length}</span></h2>
          <Button onClick={() => setIsAdding(true)} size="sm" variant={isAdding ? "secondary" : "default"}>
            <Plus className="w-4 h-4 mr-1" /> {isAdding ? "取消添加" : "添加新学科"}
          </Button>
        </div>

        {isAdding && (
          <div className="p-6 border-b bg-primary/5 flex flex-col sm:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2">
            <div className="space-y-2 w-full sm:w-1/2">
              <label className="text-sm font-medium">学科名称</label>
              <Input 
                 placeholder="例如：物理、化学、大语文" 
                 value={newName}
                 onChange={e => setNewName(e.target.value)}
                 autoFocus
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium flex items-center gap-1.5"><Palette className="w-4 h-4"/> 专属颜色</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="color" 
                  value={newColor} 
                  onChange={e => setNewColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                />
                <Input 
                   value={newColor}
                   onChange={e => setNewColor(e.target.value)}
                   className="font-mono text-muted-foreground"
                />
              </div>
            </div>
            <Button onClick={handleAdd} disabled={!newName.trim()} className="w-full sm:w-auto">
              立即创建
            </Button>
          </div>
        )}

        <div className="divide-y">
          {subjects.length === 0 && !loading ? (
             <div className="p-12 text-center text-muted-foreground">暂无任何学科。</div>
          ) : (
             subjects.map(subject => (
               <div key={subject.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  {editingId === subject.id ? (
                     // 编辑态
                     <div className="flex w-full items-center gap-4 flex-wrap sm:flex-nowrap">
                       <Input 
                         value={editName}
                         onChange={(e) => setEditName(e.target.value)}
                         className="sm:max-w-[200px]"
                       />
                       <div className="flex items-center gap-2 flex-1">
                         <input 
                            type="color" 
                            value={editColor} 
                            onChange={e => setEditColor(e.target.value)}
                            className="w-9 h-9 rounded cursor-pointer border-0 p-0"
                         />
                         <span className="text-sm text-muted-foreground font-mono bg-muted px-2 rounded hidden sm:inline-block">{editColor}</span>
                       </div>
                       <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                         <Button size="sm" onClick={() => saveEdit(subject.id)}><Check className="w-4 h-4 mr-1"/>保存</Button>
                         <Button size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4 mr-1"/>取消</Button>
                       </div>
                     </div>
                  ) : (
                     // 展示态
                     <>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0" 
                            style={{ backgroundColor: `${subject.color_code}20`, border: `1px solid ${subject.color_code}40` }}
                          >
                             <div className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color_code }} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-lg text-foreground">{subject.name}</span>
                            <span className="text-xs text-muted-foreground">最后编辑: {new Date(subject.created_at || Date.now()).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                           <Button size="sm" variant="outline" onClick={() => startEdit(subject)} title="修改信息">
                             <Edit2 className="w-4 h-4" />
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleDelete(subject.id, subject.name)} title="删除学科及作业">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                     </>
                  )}
               </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
