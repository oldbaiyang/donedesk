"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Gift, BarChart, ListTodo, BarChart3, UserCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/useUser";
import { Badge } from "@/components/ui/badge";

const links = [
  { name: "工作台", href: "/dashboard", icon: LayoutDashboard },
  { name: "学科管理", href: "/subjects", icon: BookOpen },
  { name: "全部作业", href: "/assignments", icon: ListTodo },
  { name: "奖励兑换", href: "/rewards", icon: Gift },
  { name: "数据沉淀", href: "/statistics", icon: BarChart3 },
];

export function Navigation() {
  const pathname = usePathname();
  const { profile } = useUser();

  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name || 'default'}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:right-auto md:w-64 md:border-r-0 md:h-[calc(100vh-2rem)] md:top-4 md:left-4 bg-background/60 backdrop-blur-xl border-t border-border md:border md:rounded-3xl shadow-2xl md:shadow-[0_8px_30px_rgb(0,0,0,0.08)] supports-[backdrop-filter]:bg-background/40 flex flex-col">
      <div className="flex justify-between md:flex-col p-2 md:py-8 h-full">
        <div>
          <div className="hidden md:flex flex-col items-center gap-3 px-4 mb-10 pt-4">
            <div className="bg-primary/10 p-4 rounded-2xl shadow-inner border border-primary/20">
              <BookOpen className="h-8 w-8 text-primary drop-shadow-md" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">DoneDesk</span>
          </div>
          
          <div className="flex md:flex-col w-full gap-2 justify-around md:justify-start md:px-4">
            {links.map((link) => {
              const LinkIcon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "group flex flex-col md:flex-row items-center gap-3 p-3 md:px-5 rounded-2xl transition-all duration-300 ease-out flex-1 md:flex-none",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 md:translate-x-1" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary md:hover:translate-x-1"
                  )}
                >
                  <LinkIcon className={cn("h-6 w-6 transition-transform group-hover:scale-110 duration-300", isActive && "drop-shadow-sm")} />
                  <span className="text-[10px] md:text-sm font-semibold tracking-wide">{link.name}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 用户身份卡片 */}
        <div className="md:px-4 mt-auto mb-2 hidden md:block">
          <Link 
            href="/profile" 
            className={cn(
              "flex items-center gap-3 p-3 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/40 group",
              pathname === "/profile" && "bg-muted/40 border-border/40"
            )}
          >
            <div className="relative">
              <img 
                src={avatarUrl} 
                className="h-10 w-10 rounded-xl bg-background border border-border/10 shadow-sm"
                alt="Avatar"
              />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background shadow-sm animate-pulse"></div>
            </div>
            <div className="flex flex-col truncate flex-1">
              <span className="text-sm font-bold truncate text-foreground group-hover:text-primary transition-colors">
                {profile?.full_name || "加载中..."}
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 py-0 border-primary/20 text-primary bg-primary/5 font-black uppercase">
                  {profile?.role === 'parent' ? "家长" : "学生"}
                </Badge>
              </div>
            </div>
            <Settings className="h-4 w-4 text-muted-foreground group-hover:rotate-45 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
