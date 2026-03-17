-- 1. 用户属性表 profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL CHECK (role IN ('parent', 'student')),
  parent_id UUID REFERENCES public.profiles(id), -- 如果是学生，指向其家长
  username TEXT UNIQUE,                          -- 学生登录名
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 只有家长会关联 auth.users
  user_id UUID UNIQUE
);

-- 2. 学科分类表 subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 核心作业表 assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0,
  reward_pts INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 作业附件/资料表 attachments
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 愿望奖励商品表 wishlist
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  cost_pts INTEGER NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 设置 RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 极简策略：允许所有操作（正式环境请改为基于 auth.uid() 的 parent_id/student_id 校验）
DROP POLICY IF EXISTS "Public full access" ON public.profiles;
CREATE POLICY "Public full access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.subjects;
CREATE POLICY "Public full access" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.assignments;
CREATE POLICY "Public full access" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.attachments;
CREATE POLICY "Public full access" ON public.attachments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON public.wishlist;
CREATE POLICY "Public full access" ON public.wishlist FOR ALL USING (true) WITH CHECK (true);

-- 5. 初始化 Storage Bucket 用于存储上传的附件
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 策略（开发用，允许任何人增删改查该桶内文件）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'attachments' );

DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'attachments' );

DROP POLICY IF EXISTS "Public Delete" ON storage.objects;
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'attachments' );
