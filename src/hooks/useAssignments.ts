"use client"

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "./useUser";

export type Subject = {
  id: string;
  name: string;
  color_code: string;
  created_at?: string;
};

export type Attachment = {
  id: string;
  assignment_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  created_at: string;
};

export type Assignment = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  reward_pts: number;
  subject?: Subject; // 连表查询附带的数据
  attachments?: Attachment[]; // 对应的附件
};

export function useAssignments() {
  const { userId } = useUser();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取所有学科
  const fetchSubjects = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) console.error("Error fetching subjects:", error);
    else setSubjects(data || []);
  }, [userId]);

  // 新增学科
  const addSubject = async (name: string, colorCode: string): Promise<Subject | null> => {
    if (!userId) return null;
    const { data, error } = await supabase
      .from('subjects')
      .insert({ user_id: userId, name, color_code: colorCode })
      .select()
      .single();
    if (!error) {
       await fetchSubjects();
       return data as Subject;
    }
    return null;
  };

  // 更新学科
  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const { error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchSubjects();
  };

  // 删除学科 (级联删除作业由 DB 层处理)
  const deleteSubject = async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    if (!error) await fetchSubjects();
  };

  // 根据预备获取所有作业（联表获取学科信息与附件）
  const fetchAssignments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        subject:subjects (id, name, color_code),
        attachments:attachments (*)
      `)
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (error) console.error("Error fetching assignments:", error);
    else setAssignments(data as any || []);
    setLoading(false);
  }, [userId]);

  // 新增作业任务：返回生成的实体以便关联附件
  const addAssignment = async (data: Partial<Assignment>): Promise<Assignment | null> => {
    if (!userId) return null;
    const { data: record, error } = await supabase
      .from('assignments')
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    if (!error) {
       await fetchAssignments();
       return record as Assignment;
    }
    return null;
  };

  // 上传文件到 Storage 并将其记录到附件表
  const uploadAttachment = async (assignmentId: string, file: File): Promise<boolean> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`; // 按照用户隔离

    // 1. 上传物理文件到 Storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return false;
    }

    // 2. 获取公开访问链接
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

    // 3. 在附件记录表中建关联
    const { error: dbError } = await supabase.from('attachments').insert({
      assignment_id: assignmentId,
      file_name: file.name,
      file_type: file.type || 'unknown',
      file_url: publicUrl
    });

    if (!dbError) {
      await fetchAssignments();
      return true;
    }
    return false;
  };

  // 更新作业任务状态 (如划勾标记完成)
  const updateAssignmentStatus = async (id: string, status: Assignment['status']) => {
    const updatePayload: any = { status };
    if (status === 'completed') {
       updatePayload.completed_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from('assignments')
      .update(updatePayload)
      .eq('id', id);
    if (!error) await fetchAssignments();
  };

  return {
    assignments,
    subjects,
    loading,
    fetchSubjects,
    fetchAssignments,
    addSubject,
    updateSubject,
    deleteSubject,
    addAssignment,
    updateAssignmentStatus,
    uploadAttachment
  };
}
