"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const lastUserId = useRef<string | null>(null)
  const isFetching = useRef(false)

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    if (isFetching.current) return
    
    isFetching.current = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        if (!error.message?.includes("Abort")) {
          console.error("Profile sync error:", error.message)
        }
        return
      }

      if (data) {
        setProfile(data)
        lastUserId.current = userId
      } else if (email) {
        // 直接使用传入的 Email，不再调用 supabase.auth.getUser() 避免冲突
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            role: 'parent',
            full_name: email.split('@')[0] || '管家'
          })
          .select()
          .single()
        
        if (!createError) {
          setProfile(newProfile)
          lastUserId.current = userId
        }
      }
    } catch (err) {
      console.error("Critical fetch error:", err)
    } finally {
      setLoading(false)
      isFetching.current = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // 监听 Auth 状态
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
        // 如果 ID 变了或者是初次加载
        if (lastUserId.current !== currentUser.id) {
          await fetchProfile(currentUser.id, currentUser.email)
        } else {
          setLoading(false)
        }
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
