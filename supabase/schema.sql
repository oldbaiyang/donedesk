-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. 学科分类表 subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- 如果使用 Supabase Auth, 可以关联 auth.users
  -- CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- 2. 核心作业表 assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
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

-- 设置 RLS (Row Level Security) - 请根据具体 Auth 需求完善
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- 允许匿名访问的测试策略（生产环境请修改为基于 auth.uid() 的安全规则）
CREATE POLICY "Enable all for all users" ON public.subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON public.assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON public.attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for all users" ON public.wishlist FOR ALL USING (true) WITH CHECK (true);

-- 5. 初始化 Storage Bucket 用于存储上传的附件
INSERT INTO storage.buckets (id, name, public) 
VALUES ('attachments', 'attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage RLS 策略（开发用，允许任何人增删改查该桶内文件）
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'attachments' );
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'attachments' );
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'attachments' );
