"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, Lock, UserPlus, LogIn, ArrowRight } from "lucide-react"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAuth = async (type: 'login' | 'signup') => {
    if (!email || !password) {
      setMessage({ type: 'error', text: "请填写完整邮箱和密码" })
      return
    }

    setLoading(true)
    setMessage(null)
    
    try {
      const { error } = type === 'login' 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (type === 'signup') {
        setMessage({ type: 'success', text: "注册指令已发送！请检查邮箱（或直接尝试登录，取决于项目配置）。" })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "连接失败，请检查网络或配置" })
    } finally {
      setLoading(false)
    }
  }

  const handleResetRequest = async () => {
    if (!email) {
      setMessage({ type: 'error', text: "请输入您的邮箱地址" })
      return
    }

    setLoading(true)
    setMessage(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: "重置邮件已发送！请检查您的收件箱。" })
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: "发送失败，请重试" })
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
        
        <div className="p-8 relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
               <span className="text-3xl font-black text-white italic">D</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-accent">
              Welcome to DoneDesk
            </h1>
            <p className="text-muted-foreground mt-2 text-sm font-medium">最强学生作业管理系统・家庭协作版</p>
          </div>

          {isResetting ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-foreground">找回密码</h2>
                <p className="text-xs text-muted-foreground font-medium">输入邮箱，我们将为您发送重置链接</p>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                <Input 
                  type="email" 
                  placeholder="注册邮箱" 
                  className="pl-11 h-12 bg-muted/20 border-border/20 rounded-xl focus-visible:ring-primary/20 transition-all font-medium text-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {message && (
                <div className={`p-4 rounded-2xl text-[11px] leading-relaxed font-bold animate-in zoom-in-95 duration-300 ${
                  message.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  disabled={loading} 
                  onClick={handleResetRequest}
                  className="w-full h-12 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "发送重置邮件"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => { setIsResetting(false); setMessage(null); }}
                  className="w-full text-muted-foreground text-xs hover:bg-muted/30 rounded-xl"
                >
                  返回登录
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 rounded-2xl">
                <TabsTrigger value="login" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">登录</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-300">注册家长</TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                      type="email" 
                      placeholder="邮箱地址" 
                      className="pl-11 h-12 bg-muted/20 border-border/20 rounded-xl focus-visible:ring-primary/20 transition-all font-medium text-foreground"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                      type="password" 
                      placeholder="登录密码" 
                      className="pl-11 h-12 bg-muted/20 border-border/20 rounded-xl focus-visible:ring-primary/20 transition-all font-medium text-foreground"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end p-1">
                    <button 
                      onClick={() => { setIsResetting(true); setMessage(null); }}
                      className="text-[10px] font-bold text-primary hover:underline transition-all"
                    >
                      忘记密码？
                    </button>
                  </div>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-2xl text-[11px] leading-relaxed font-bold animate-in zoom-in-95 duration-300 ${
                  message.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                }`}>
                  {message.text}
                </div>
              )}

              <TabsContent value="login" className="m-0">
                <Button 
                  disabled={loading} 
                  onClick={() => handleAuth('login')}
                  className="w-full h-12 rounded-2xl font-bold text-base shadow-xl shadow-primary/30 group relative overflow-hidden active:scale-[0.98] transition-all bg-gradient-to-r from-indigo-600 via-blue-700 to-primary text-white border-none"
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" />
                        开启学习魔法 <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 m-0">
                <Button 
                  disabled={loading} 
                  onClick={() => handleAuth('signup')}
                  className="w-full h-12 rounded-2xl font-bold text-base shadow-xl shadow-accent/30 group relative overflow-hidden active:scale-[0.98] transition-all bg-gradient-to-r from-accent via-purple-700 to-indigo-800 text-white border-none"
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center">
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        注册家长管理员
                      </>
                    )}
                  </div>
                </Button>
                <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed px-4">
                  点击注册即表示您同意我们的服务协议，学生账号将在您进入系统后一键创建。
                </p>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </Card>
    </div>
  )
}
