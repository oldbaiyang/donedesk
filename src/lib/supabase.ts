import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️  请在根目录的 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co", 
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // 覆盖 Supabase 默认的 Web Locks API，直接执行回调函数。
      // 这是解决 React StrictMode 双重挂载导致的 "Lock broken by another request with the 'steal' option" 的终极方案。
      // 单浏览器标签页场景下不存在真正的并发安全问题。
      lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
        return await fn()
      },
    },
  }
);
