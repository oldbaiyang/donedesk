import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// 如果尚未配置环境变量，提供友好的警告机制而不是阻碍编译
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  请在根目录的 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co", 
  supabaseAnonKey || "placeholder-anon-key"
);
