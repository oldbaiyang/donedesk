"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types/assignment"

type UserContextType = {
  user: any
  profile: Profile | null
  userId: string | undefined
  loading: boolean
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  userId: undefined,
  loading: true,
  refreshProfile: async () => {},
})

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
    if (data) setProfile(data)
  }, [user?.id])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const studentId = localStorage.getItem('donedesk_student_id')
        
        if (!mounted) return
        
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // 优先加载正式登录用户 (家长)
        if (currentUser) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle()

          if (!mounted) return

          if (existingProfile) {
            setProfile(existingProfile)
          } else {
            // 建档逻辑保持不变
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
        // 其次尝试载入虚拟登录用户 (学生)
        else if (studentId) {
          const { data: studentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', studentId)
            .maybeSingle()
          
          if (mounted && studentProfile) {
            setProfile(studentProfile)
          }
        }
      } catch (err) {
        console.error("Auth init error:", err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      // 处理登出
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        localStorage.removeItem('donedesk_student_id')
        return
      }

      if (event === 'INITIAL_SESSION') return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        localStorage.removeItem('donedesk_student_id') // 邮箱登录后清除学生标记
        void supabase
          .from('profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle()
          .then(({ data }) => {
            if (mounted && data) setProfile(data)
          })
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, profile, userId: user?.id, loading, refreshProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
