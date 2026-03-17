"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { Assignment, Subject, Attachment } from "@/types/assignment";

type AssignmentsContextType = {
  assignments: Assignment[];
  subjects: Subject[];
  loading: boolean;
  fetchSubjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  addSubject: (name: string, colorCode: string) => Promise<Subject | null>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addAssignment: (data: Partial<Assignment>) => Promise<Assignment | null>;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => Promise<void>;
  uploadAttachment: (assignmentId: string, file: File) => Promise<boolean>;
};

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useUser();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

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

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const { error } = await supabase
      .from('subjects')
      .update(updates)
      .eq('id', id);
    if (!error) await fetchSubjects();
  };

  const deleteSubject = async (id: string) => {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    if (!error) await fetchSubjects();
  };

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

  const uploadAttachment = async (assignmentId: string, file: File): Promise<boolean> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return false;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(filePath);

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

  // 这里的 useEffect 确保一旦 userId 可用，数据就会加载
  useEffect(() => {
    if (userId) {
      fetchSubjects();
      fetchAssignments();
    }
  }, [userId, fetchSubjects, fetchAssignments]);

  return (
    <AssignmentsContext.Provider value={{
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
    }}>
      {children}
    </AssignmentsContext.Provider>
  );
}

export function useAssignmentsContext() {
  const context = useContext(AssignmentsContext);
  if (context === undefined) {
    throw new Error("useAssignmentsContext must be used within an AssignmentsProvider");
  }
  return context;
}
