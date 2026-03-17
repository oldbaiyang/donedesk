"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 记录上一次成功处理的 UserId，避免状态震荡
  const lastUserId = useRef<string | null>(null)
  const isFetching = useRef(false)

  const fetchProfile = useCallback(async (userId: string) => {
    // 如果已经有 profile 且 ID 没变，或者是正在请求中，则跳过
    if ((lastUserId.current === userId && profile) || isFetching.current) return
    
    isFetching.current = true
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        // 彻底静默处理终止请求相关的报错，不再打印
        if (!error.message?.includes("Abort")) {
          console.error("Profile sync error:", error.message)
        }
        return
      }

      if (data) {
        setProfile(data)
        lastUserId.current = userId
      } else {
        // 自动创建逻辑
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser?.id === userId) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              role: 'parent',
              full_name: authUser.email?.split('@')[0] || '管家'
            })
            .select()
            .single()
          
          if (!createError) {
            setProfile(newProfile)
            lastUserId.current = userId
          }
        }
      }
    } catch (err) {
      // 捕获所有潜在的同步异常
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [profile])

  useEffect(() => {
    let mounted = true

    // 💡 核心修复：仅依靠 onAuthStateChange 处理。
    // Supabase 会在订阅时立即触发一次 INITIAL_SESSION 事件。
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setLoading(false)
        lastUserId.current = null
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return { user, profile, userId: user?.id, loading }
}
