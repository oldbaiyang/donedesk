"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { compressImage } from "@/lib/image";
import { Assignment, Subject, Profile } from "@/types/assignment";

type AssignmentsContextType = {
  assignments: Assignment[];
  subjects: Subject[];
  profiles: Profile[]; // 该家庭下的所有成员
  activeStudentId: string | null;
  setActiveStudentId: (id: string | null) => void;
  loading: boolean;
  fetchSubjects: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchProfiles: () => Promise<void>;
  addSubject: (name: string, colorCode: string) => Promise<Subject | null>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addAssignment: (data: Partial<Assignment>) => Promise<Assignment | null>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => Promise<void>;
  uploadAttachment: (assignmentId: string, file: File, purpose?: 'material' | 'submission') => Promise<boolean>;
  addStudent: (fullName: string) => Promise<Profile | null>;
  updateStudent: (id: string, updates: Partial<Profile>) => Promise<boolean>;
};

const AssignmentsContext = createContext<AssignmentsContextType | undefined>(undefined);

export function AssignmentsProvider({ children }: { children: React.ReactNode }) {
  const { profile, userId } = useUser();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 获取该家庭下的所有成员
  const fetchProfiles = useCallback(async () => {
    if (!profile) return;
    
    // 如果是家长，获取自己创建的所有学生
    if (profile.role === 'parent') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${profile.id},parent_id.eq.${profile.id}`)
        .order('role', { ascending: false });
      
      if (error) {
        if (!error.message?.includes("Abort")) {
          console.error("Error fetching profiles (Stringified):", JSON.stringify(error, null, 2));
        }
        return;
      }
      
      setProfiles(data || []);
      // 默认选中第一个学生（如果有）
      const firstStudent = data?.find(p => p.role === 'student');
      if (firstStudent && !activeStudentId) {
        setActiveStudentId(firstStudent.id);
      }
    } else {
      setProfiles([profile]);
      setActiveStudentId(profile.id);
    }
  }, [profile, activeStudentId]);

  const fetchSubjects = useCallback(async () => {
    const pId = profile?.role === 'parent' ? profile.id : profile?.parent_id;
    if (!pId) return;

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('parent_id', pId)
      .order('created_at', { ascending: true });
    
    if (error) {
      if (!error.message?.includes("Abort")) {
        console.error("Error fetching subjects (Stringified):", JSON.stringify(error, null, 2));
      }
    } else {
      setSubjects(data || []);
    }
  }, [profile]);

  const fetchAssignments = useCallback(async () => {
    const sId = activeStudentId;
    if (!sId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        subject:subjects (id, name, color_code),
        attachments:attachments (*)
      `)
      .eq('student_id', sId)
      .order('due_date', { ascending: true });

    if (error) {
      if (!error.message?.includes("Abort")) {
        console.error("Error fetching assignments (Stringified):", JSON.stringify(error, null, 2));
      }
    } else {
      setAssignments(data as any || []);
    }
    setLoading(false);
  }, [activeStudentId]);

  const addSubject = async (name: string, colorCode: string): Promise<Subject | null> => {
    if (profile?.role !== 'parent') return null;
    const { data, error } = await supabase
      .from('subjects')
      .insert({ parent_id: profile.id, name, color_code: colorCode })
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

  const addAssignment = async (data: Partial<Assignment>): Promise<Assignment | null> => {
    if (!activeStudentId) return null;
    const { data: record, error } = await supabase
      .from('assignments')
      .insert({ ...data, student_id: activeStudentId })
      .select()
      .single();
    if (!error) {
       await fetchAssignments();
       return record as Assignment;
    }
    return null;
  };

  const uploadAttachment = async (assignmentId: string, file: File, purpose: 'material' | 'submission' = 'material'): Promise<boolean> => {
    if (!userId) return false;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    let uploadData: File | Blob = file;
    
    // 如果是图片，先进行压缩处理
    if (file.type.startsWith('image/')) {
        try {
            uploadData = await compressImage(file);
        } catch (err) {
            console.error("Compression failed, uploading original:", err);
        }
    }

    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, uploadData, {
        contentType: uploadData.type,
        upsert: true
      });

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
      file_type: uploadData.type || 'unknown',
      file_url: publicUrl,
      purpose: purpose
    });

    if (!dbError) {
      await fetchAssignments();
      return true;
    }
    return false;
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    // 过滤掉不属于数据库列的字段（如 subject, attachments）
    const { subject, attachments, ...dbUpdates } = updates as any;

    const { error } = await supabase
      .from('assignments')
      .update(dbUpdates)
      .eq('id', id);
    
    if (error) {
      console.error("Error updating assignment (Full):", JSON.stringify(error, null, 2));
    } else {
      await fetchAssignments();
    }
  };

  const updateAssignmentStatus = async (id: string, status: Assignment['status']) => {
    const updatePayload: any = { status };
    if (status === 'completed') {
       updatePayload.completed_at = new Date().toISOString();
    }
    await updateAssignment(id, updatePayload);
  };

  const addStudent = async (fullName: string): Promise<Profile | null> => {
    if (profile?.role !== 'parent') return null;
    
    // 生成一个基于名字的随机头像种子
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`;
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({ 
        parent_id: profile.id, 
        full_name: fullName, 
        role: 'student',
        avatar_url: avatarUrl
      })
      .select()
      .single();

    if (!error && data) {
       await fetchProfiles();
       // 重新获取学科以确保权限同步（虽然学科是跟着家长走的）
       await fetchSubjects();
       return data as Profile;
     }
    
    if (error) {
      console.error("Error adding student:", JSON.stringify(error, null, 2));
    }
    return null;
  };

  const updateStudent = async (id: string, updates: Partial<Profile>): Promise<boolean> => {
    if (profile?.role !== 'parent') return false;
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);
    
    if (!error) {
      await fetchProfiles();
      return true;
    }
    
    console.error("Error updating student:", error);
    return false;
  };

  useEffect(() => {
    if (profile) {
      fetchProfiles();
      fetchSubjects();
    }
  }, [profile, fetchProfiles, fetchSubjects]);

  useEffect(() => {
    if (activeStudentId) {
      fetchAssignments();
    }
  }, [activeStudentId, fetchAssignments]);

  return (
    <AssignmentsContext.Provider value={{
      assignments,
      subjects,
      profiles,
      activeStudentId,
      setActiveStudentId,
      loading,
      fetchSubjects,
      fetchAssignments,
      fetchProfiles,
      addSubject,
      updateSubject,
      deleteSubject,
      addAssignment,
      updateAssignment,
      updateAssignmentStatus,
      uploadAttachment,
      addStudent,
      updateStudent
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
