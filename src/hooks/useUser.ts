"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 使用 Ref 记录当前正在处理的 UserId，防止重复请求和竞态冲突
  const processingUserId = useRef<string | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    // 如果已经在处理该用户且已有 profile，则跳过
    if (processingUserId.current === userId) return
    processingUserId.current = userId
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        // 忽略中止请求的报错
        if (error.message?.includes("Abort")) {
          return
        }
        console.error("Fetch profile error details (Stringified):", JSON.stringify(error, null, 2))
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // 创建新 Profile (仅限家长)
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (authUser) {
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
          }
        }
      }
    } catch (err) {
      console.error("Profile sync fatal error:", err)
    } finally {
      setLoading(false)
      // 处理完成后清空 Ref，允许下一次可能的显式刷新进度，但由于 profile 已设置，逻辑会闭环
    }
  }, []) // 关键：移除 profile 依赖，彻底解开死循环

  useEffect(() => {
    let mounted = true

    const syncUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setLoading(false)
        processingUserId.current = null
      }
    }

    syncUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setLoading(false)
        processingUserId.current = null
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  return { user, profile, userId: user?.id, loading }
}
