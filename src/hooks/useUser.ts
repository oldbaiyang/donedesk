"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. 监听 Auth 状态
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile 不存在，通常是刚注册的家长，需要自动创建
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              user_id: userId,
              role: 'parent',
              full_name: userData.user.email?.split('@')[0] || '家长'
            })
            .select()
            .single()
          
          if (!createError) setProfile(newProfile)
        }
      } else if (!error) {
        setProfile(data)
      }
    } finally {
      setLoading(false)
    }
  }

  return { user, profile, userId: user?.id, loading }
}
