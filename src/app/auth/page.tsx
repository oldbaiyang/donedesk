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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true)
    setMessage(null)
    
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else if (type === 'signup') {
      setMessage({ type: 'success', text: "注册成功！请检查邮箱进行验证（如果开启了策略）或直接登录。" })
    }
    setLoading(false)
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

          <Tabs defaultValue="login" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 rounded-2xl">
              <TabsTrigger value="login" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">登录</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">注册家长</TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="email" 
                    placeholder="邮箱地址" 
                    className="pl-11 h-12 bg-muted/20 border-border/40 rounded-xl focus-visible:ring-primary/30 transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="登录密码" 
                    className="pl-11 h-12 bg-muted/20 border-border/40 rounded-xl focus-visible:ring-primary/30 transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2 ${
                message.type === 'error' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <TabsContent value="login">
              <Button 
                disabled={loading} 
                onClick={() => handleAuth('login')}
                className="w-full h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 group relative overflow-hidden active:scale-95 transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center">
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                  开启学习魔法 <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </TabsContent>

            <TabsContent value="signup">
              <Button 
                disabled={loading} 
                onClick={() => handleAuth('signup')}
                className="w-full h-12 rounded-2xl font-bold text-base bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 group active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                注册家长管理员
              </Button>
              <p className="text-[10px] text-center text-muted-foreground mt-4 px-4">
                点击注册即表示您同意我们的服务协议，学生账号将在您进入系统后一键创建。
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  )
}
