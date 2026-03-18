export type Subject = {
  id: string;
  parent_id: string;
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
  purpose: 'material' | 'submission';
  created_at: string;
};

export type Assignment = {
  id: string;
  user_id: string; // 创建者 ID
  student_id: string;
  subject_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  start_date: string | null;
  due_date: string | null;
  completed_at: string | null;
  reward_pts: number;
  student_notes: string | null;
  subject?: Subject;
  attachments?: Attachment[];
};

export type Profile = {
  id: string;
  role: 'parent' | 'student';
  parent_id: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  user_id: string | null;
  password?: string | null;
  created_at?: string;
};
