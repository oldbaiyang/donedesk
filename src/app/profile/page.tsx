"use client"

import { useState, useRef } from "react"
import { useUser } from "@/hooks/useUser"
import { useAssignmentsContext } from "@/providers/AssignmentsProvider"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  ShieldCheck, 
  LogOut, 
  Users, 
  Plus, 
  Calendar,
  ChevronRight,
  Camera,
  Pencil,
  Check,
  X,
  Loader2
} from "lucide-react"

export default function ProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useUser()
  const { profiles } = useAssignmentsContext()
  
  // 昵称编辑
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // 头像上传
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const startEditName = () => {
    setEditName(profile?.full_name || "")
    setIsEditingName(true)
  }

  const cancelEditName = () => {
    setIsEditingName(false)
    setEditName("")
  }

  const saveName = async () => {
    if (!profile?.id || !editName.trim()) return
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName.trim() })
        .eq('id', profile.id)
      
      if (!error) {
        await refreshProfile()
        setIsEditingName(false)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id || !user?.id) return

    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}-${Date.now()}.${fileExt}`

      // 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.error("Avatar upload error:", uploadError)
        return
      }

      // 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath)

      // 更新 Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)

      if (!updateError) {
        await refreshProfile()
      }
    } finally {
      setIsUploadingAvatar(false)
      // 重置 input 以允许重复选择同一文件
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  if (authLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </div>
  )

  if (!user) return null

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || user.email}`;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 隐藏的文件选择器 */}
      <input 
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarUpload}
      />

      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground">账户中心</h1>
        <p className="text-muted-foreground font-medium">管理您的身份设置与家庭成员</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：个人基本信息卡片 */}
        <Card className="lg:col-span-1 p-8 rounded-[2.5rem] bg-background/40 backdrop-blur-2xl border-primary/10 shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* 头像区域 */}
            <div className="relative mb-6">
              <div className="h-32 w-32 rounded-3xl overflow-hidden border-4 border-background shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 bg-muted">
                {isUploadingAvatar ? (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                )}
              </div>
              <button 
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/40 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* 昵称编辑区 */}
            {isEditingName ? (
              <div className="flex items-center gap-2 mb-1 w-full max-w-[220px]">
                <Input 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-center font-black text-lg h-10 rounded-xl"
                  placeholder="输入昵称"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                />
                <button 
                  onClick={saveName} 
                  disabled={isSaving}
                  className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shrink-0"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </button>
                <button 
                  onClick={cancelEditName} 
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 cursor-pointer group/name" onClick={startEditName}>
                <h2 className="text-2xl font-black text-foreground">{profile?.full_name || "点击设置昵称"}</h2>
                <Pencil className="h-4 w-4 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-6 h-8">
              {profile ? (
                <Badge className="bg-primary text-white border-none px-3 py-1 rounded-lg font-bold">
                  {profile.role === 'parent' ? "家长管理员" : "学生子账号"}
                </Badge>
              ) : (
                <Badge variant="outline" className="animate-pulse">身份初始化中</Badge>
              )}
            </div>

            <div className="w-full space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/20 flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col truncate">
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">注册邮箱</span>
                  <span className="text-sm font-bold text-foreground truncate">{user.email}</span>
                </div>
              </div>
              
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/20 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">加入时间</span>
                  <span className="text-sm font-bold text-foreground">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('zh-CN') : '-'}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full mt-8 h-12 rounded-2xl font-black text-base shadow-lg shadow-destructive/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <LogOut className="mr-2 h-5 w-5" />
              退出登录
            </Button>
          </div>
        </Card>

        {/* 右侧 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 rounded-[2.5rem] bg-background/40 backdrop-blur-2xl border-primary/10 shadow-xl relative min-h-[300px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-accent/10 text-accent">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-foreground">家庭成员</h3>
              </div>
              {profile?.role === 'parent' && (
                <Button variant="outline" className="rounded-xl font-bold border-accent/20 text-accent hover:bg-accent/10">
                  <Plus className="mr-1 h-4 w-4" /> 添加学生
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profiles.map((p) => (
                <div 
                  key={p.id}
                  className="p-4 rounded-3xl bg-muted/20 border border-border/10 flex items-center gap-4 hover:bg-muted/40 transition-colors group cursor-pointer"
                >
                  <img 
                    src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.full_name}`} 
                    className="h-12 w-12 rounded-2xl bg-background border border-border/10 shadow-sm"
                    alt={p.full_name || ""}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{p.full_name}</span>
                      {p.role === 'parent' && <Badge className="text-[9px] h-4 bg-primary text-white border-none">您</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{p.role === 'parent' ? "家庭管理员" : "学生子账号"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </div>
            
            {profiles.length <= 1 && profile?.role === 'parent' && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 rounded-full bg-muted/30 flex items-center justify-center mb-4 text-muted-foreground italic font-black text-2xl">?</div>
                <p className="text-muted-foreground font-medium mb-2">还没有添加学生账号</p>
                <p className="text-xs text-muted-foreground/60 max-w-[240px]">添加学生后，您可以为他们分配专属的学习任务和励志积分。</p>
              </div>
            )}
          </Card>

          <Card className="p-8 rounded-[2.5rem] bg-background/40 backdrop-blur-2xl border-primary/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black text-foreground">账户安全</h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-6">您的数据目前受 Supabase RLS (行级安全策略) 保护。只有您的家庭成员可以访问相关作业与学科信息。</p>
            <Button variant="link" className="p-0 text-primary font-bold h-auto hover:no-underline hover:opacity-80 transition-opacity">
              了解更多关于 DoneDesk 隐私保护
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
