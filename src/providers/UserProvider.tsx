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

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  const lastUserId = useRef<string | null>(null)
  const isFetchingProfile = useRef(false)

  const fetchProfile = useCallback(async (userId: string, email?: string) => {
    if (isFetchingProfile.current) return
    
    isFetchingProfile.current = true
    // 这里不再立刻把 loading 设为 true，防止界面闪烁太剧烈，因为 AuthWrapper 会根据 loading 显示转圈
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        if (!error.message?.includes("Abort")) {
          console.error("Profile sync error details:", JSON.stringify(error, null, 2))
        }
        return
      }

      if (data) {
        setProfile(data)
        lastUserId.current = userId
      } else if (email) {
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
      console.error("Critical UserProvider fetch error:", err)
    } finally {
      setLoading(false)
      isFetchingProfile.current = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // 单一监听器源头
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      if (currentUser) {
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

  return (
    <UserContext.Provider value={{ user, profile, userId: user?.id, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUserContext must be used within a UserProvider")
  }
  return context
}
