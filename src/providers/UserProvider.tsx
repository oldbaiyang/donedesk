"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

type UserContextType = {
  user: any
  profile: Profile | null
  userId: string | undefined
  loading: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  userId: undefined,
  loading: true,
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        // 1. 先同步获取当前 session (本地存储读取，不触发网络请求)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          // 2. 获取或创建 Profile
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle()

          if (!mounted) return

          if (existingProfile) {
            setProfile(existingProfile)
          } else {
            // 自动创建家长 Profile
            const { data: newProfile } = await supabase
              .from('profiles')
              .insert({
                user_id: currentUser.id,
                role: 'parent',
                full_name: currentUser.email?.split('@')[0] || '管家'
              })
              .select()
              .single()

            if (mounted && newProfile) {
              setProfile(newProfile)
            }
          }
        }
      } catch (err) {
        console.error("Auth init error:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    // 3. 监听后续的登录/登出变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      // 只处理实际的状态变化事件，不处理 INITIAL_SESSION (已在 init 中处理)
      if (event === 'INITIAL_SESSION') return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle()

        if (mounted && data) {
          setProfile(data)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, profile, userId: user?.id, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
