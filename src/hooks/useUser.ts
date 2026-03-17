"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      // 1. 尝试获取现有 Profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error("Fetch profile error:", error)
        return
      }

      if (data) {
        setProfile(data)
      } else {
        // 2. 如果不存在，强制创建一个家长角色 (因为目前只有家长通过 Auth 注册)
        const { data: userResponse } = await supabase.auth.getUser()
        const email = userResponse?.user?.email
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            role: 'parent', // 核心修正：强制锁定为 parent
            full_name: email?.split('@')[0] || '管家'
          })
          .select()
          .single()
        
        if (createError) {
          console.error("Create profile error:", createError)
        } else {
          setProfile(newProfile)
        }
      }
    } catch (err) {
      console.error("Profile sync fatal error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // 监听 Auth 状态
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  return { user, profile, userId: user?.id, loading }
}
