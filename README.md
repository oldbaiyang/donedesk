# DoneDesk (最强学生作业管理系统)

DoneDesk 是一款专为学生设计的、具有“拟态玻璃感”视觉风格的结构化作业管理工具。它通过建立学科依赖、积分激励及 Obsidian 式的 Markdown 联动，解决任务零散与资料丢失的问题。

## 🚀 核心功能
- **拟态工作台**：基于 Next.js 15 和现代 CSS，提供极致的毛玻璃悬浮交互体验。
- **Obsidian 融合编辑器**：采用 Tiptap V2，实现编辑与预览合一的 Markdown 录入体验。
- **智能详情渲染**：
  - **图片横排与灯箱**：支持 `![]()` 图片横向排列并可通过点击放大（ImageZoom）。
  - **卡片智能预览**：列表页卡片能自动识别详情图片并渲染为精致缩略图。
  - **自动链接与换行**：支持 URL 自动识别、新标签页跳转及硬换行。
- **学科与积分激励**：任务关联学科及分值，提供及时的完成反馈。
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
