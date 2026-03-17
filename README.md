# DoneDesk - 高屏效学生任务与奖励管理系统

DoneDesk 是一款专为学生设计的、具有现代感视觉体验的任务追踪与激励系统。它通过“任务-积分-奖励”的闭环逻辑，帮助用户高效管理日常学习任务并建立正向反馈。

---

## ✨ 核心功能

- **🚀 智能化工作台**：支持学科分类、截止日期追踪、任务优先级管理。
- **🍱 拟态视觉详情**：基于 Glassmorphism (毛玻璃拟态) 设计的任务详情弹出层，支持多附件极速下载。
- **💎 激励系统**：完成任务赚取积分，兑换自定义愿望单奖励。
- **📊 数据可视化**：自动统计任务完成率与积分增长曲线。
- **☁️ 云端同步**：基于 Supabase 实现的多端实时同步与附件存储。

## 🛠️ 技术栈

- **框架**：[Next.js 15 (App Router)](https://nextjs.org/)
- **后端/数据库**：[Supabase](https://supabase.com/) (PostgreSQL + Storage + Auth)
- **UI 组件库**：[Base UI](https://base-ui.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **样式**：Tailwind CSS (自定义拟态设计语言)
- **图标**：Lucide React

## 🏁 快速启动

### 1. 克隆并安装依赖
```bash
npm install
```

### 2. 环境配置
在根目录创建 `.env.local` 文件，配置你的 Supabase 凭证：
```env
NEXT_PUBLIC_SUPABASE_URL=你的URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的KEY
```

### 3. 运行开发服务器
```bash
npm run dev
```

## 📂 项目结构

- `/src/app`: 定义路由与核心页面逻辑。
- `/src/components`: 业务组件与底层 UI 原子组件 (基于 Shadcn)。
- `/src/hooks`: 核心业务逻辑 Hooks (`useAssignments`, `useRewards`)。
- `/src/lib`: Supabase 客户端配置。
- `/supabase`: 数据库初始化脚本与 Schema 定义。

---

更多技术实现细节请参考 [ARCHITECTURE.md](./ARCHITECTURE.md)。

