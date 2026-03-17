"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const lastFetchedId = useRef<string | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    // 简单的并发防护：如果正在获取同一个 ID，则跳过
    if (lastFetchedId.current === userId && profile) return
    lastFetchedId.current = userId
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        // 如果是终止错误，通常是因为短时间内多次触发，可以忽略
        if (error.message?.includes("AbortError")) {
          console.warn("Profile fetch aborted due to concurrency.")
          return
        }
        console.error("Fetch profile error details (Stringified):", JSON.stringify(error, null, 2))
        return
      }

      if (data) {
        setProfile(data)
      } else {
        const { data: userResponse } = await supabase.auth.getUser()
        const email = userResponse?.user?.email
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            role: 'parent',
            full_name: email?.split('@')[0] || '管家'
          })
          .select()
          .single()
        
        if (!createError) {
          setProfile(newProfile)
        }
      }
    } catch (err) {
      console.error("Profile sync fatal error:", err)
    } finally {
      setLoading(false)
    }
  }, [profile])

  useEffect(() => {
    // 统一通过 onAuthStateChange 处理初始化和变更
    // 这能有效防止 initAuth() 和 onAuthStateChange() 引起的并发冲突
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return { user, profile, userId: user?.id, loading }
}
