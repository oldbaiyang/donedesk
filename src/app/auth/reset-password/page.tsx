"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Loader2, Lock, CheckCircle2, ArrowRight } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'editing' | 'success' | 'error'>('editing')
  const [message, setMessage] = useState("")

  useEffect(() => {
    // 检查是否有恢复会话 (Supabase 会自动处理 URL 中的 hash)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // 如果没有会话，说明链接可能失效或非法进入
        // 注意：有些项目配置下点击重置邮件后是已登录状态
      }
    }
    checkSession()
  }, [])

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setMessage("新密码长度不能少于 6 位")
      setStatus('error')
      return
    }

    if (password !== confirmPassword) {
      setMessage("两次输入的密码不一致")
      setStatus('error')
      return
    }

    setLoading(true)
    setMessage("")
    
    // 增加超时控制：10秒必断开
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("请求超时，请检查网络后再试")), 10000)
    })

    try {
      const updatePromise = supabase.auth.updateUser({ password })
      const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as any
      
      if (error) {
        console.error("Reset password error details:", JSON.stringify(error, null, 2))
        setMessage(error.message || "设置失败，请稍后重试")
        setStatus('error')
      } else {
        console.log("Password reset successfully from recovery link")
        setStatus('success')
      }
    } catch (err: any) {
      console.error("Critical reset password exception:", err)
      setMessage(err.message || "设置过程发生异常")
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] overflow-hidden">
      {/* 动态背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-full z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <Card className="w-full max-w-md border-primary/10 bg-background/40 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden rounded-[2.5rem] relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none"></div>
        
        <div className="p-8 relative z-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-6 rotate-3">
             <span className="text-3xl font-black text-white italic">D</span>
          </div>

          {status === 'success' ? (
            <div className="space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-foreground">密码重置成功！</h2>
                <p className="text-sm text-muted-foreground font-medium">您的新密码已生效，现在可以开启学习之旅了。</p>
              </div>
              <Button 
                onClick={() => window.location.href = "/"}
                className="w-full h-12 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
              >
                进入系统 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-foreground">重置您的密码</h1>
                <p className="text-muted-foreground text-sm font-medium">请为您的 DoneDesk 账户设置一个强力新密码</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                  <Input 
                    type="password" 
                    placeholder="新密码 (至少 6 位)" 
                    className="pl-11 h-12 bg-muted/20 border-border/20 rounded-xl focus-visible:ring-primary/20 transition-all font-medium text-foreground"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                  <Input 
                    type="password" 
                    placeholder="确认新密码" 
                    className="pl-11 h-12 bg-muted/20 border-border/20 rounded-xl focus-visible:ring-primary/20 transition-all font-medium text-foreground"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-2xl text-[11px] leading-relaxed font-bold animate-in zoom-in-95 duration-300 ${
                  status === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'text-muted-foreground'
                }`}>
                  {message}
                </div>
              )}

              <Button 
                disabled={loading} 
                onClick={handleReset}
                className="w-full h-12 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "更新密码并登录"}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
