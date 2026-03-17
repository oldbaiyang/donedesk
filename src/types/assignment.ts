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
  start_date: string | null;
  due_date: string | null;
  reward_pts: number;
  subject?: Subject;
  attachments?: Attachment[];
};
