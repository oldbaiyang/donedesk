# DoneDesk (最强学生作业管理系统)

DoneDesk 是一款专为学生设计的、具有“拟态玻璃感”视觉风格的结构化作业管理工具。它通过建立学科依赖、积分激励及 Obsidian 式的 Markdown 联动，解决任务零散与资料丢失的问题。

## 🚀 核心功能
- **拟态工作台**：基于 Next.js 15 和现代 CSS，提供极致的毛玻璃悬浮交互体验。内建 **Skeleton 骨架屏**，消除数据加载闪烁。
- **全能详情页**：
  - **任务区与提交区**：界面逻辑分割，支持学生备注、家长备注及阶段性存草稿。
  - **附件中心**：支持 `material` (资料) 与 `submission` (成果) 分类存储，集成 **ImageZoom** 灯箱。
  - **图片自动压缩**：上传前进行像素级压缩 (1024px)，兼顾加载速度与清晰度。
- **家庭协同系统**：
  - **双角色模型**：家长拥有全量管控权；学生支持“自建自管”，禁止越权修改家长布置的任务。
  - **一键切娃**：侧边栏集成学生切换器，家长可瞬间跳转至不同子女的工作台查看进度。
- **学科与积分激励**：任务关联学科及分值，提供及时的完成反馈，支持学生端愿望清单兑换。
- **Supabase 数据驱动**：实时同步任务状态，确保多端数据一致。

## 🛠️ 技术栈
- **Frontend**: Next.js 16 (Turbopack), React 19, TailwindCSS 4
- **Editor**: Tiptap V2, tiptap-markdown
- **Markdown**: react-markdown, remark-gfm, remark-breaks
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: @base-ui/react, Lucide React

## 📖 快速上手
```bash
npm install
npm run dev
```

---
详细方案请参考 [ARCHITECTURE.md](./ARCHITECTURE.md)
