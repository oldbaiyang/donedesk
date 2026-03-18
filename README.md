# DoneDesk (最强学生作业管理系统)

DoneDesk 是一款专为学生设计的、具有“拟态玻璃感”视觉风格的结构化作业管理工具。它通过建立学科依赖、积分激励及 Obsidian 式的 Markdown 联动，解决任务零散与资料丢失的问题。

## 🚀 核心功能
- **学科智能筛选**：列表页与工作台支持按学科分类进行实时过滤，帮助快速定位特定学科的任务。
- **HEIC 图片全链路支持**：集成 `heic-to` 动态转换。上传 HEIC/HEIF 文件会自动转换为 JPEG 并重命名为 `.jpg` 存储，解决全平台浏览器无法展示苹果原生格式图片的问题。
- **全能详情页**：
  - **任务区与提交区**：界面逻辑分割，支持学生备注、家长备注及阶段性存草稿。
  - **附件中心**：支持 `material` (资料) 与 `submission` (成果) 分类存储，展示图片缩略图，并集成 **ImageZoom** 灯箱。
- **家庭协同系统**：
  - **双角色模型**：家长拥有全量管控权；学生支持“自建自管”，针对家长布置的任务仅能提交作业。
  - **动态评价与激励**：任务关联学科及分值。修复了家长模式下积分归属 Bug，确保积分实时准确反馈至学生。
  - **一键切娃**：侧边栏集成学生切换器，家长可瞬间跳转至不同子女的工作台查看进度。
- **Supabase 数据驱动**：实时同步任务状态，确保多端数据一致。

## 🛠️ 技术栈
- **Frontend**: Next.js 16 (Turbopack), React 19, TailwindCSS 4
- **Image Handling**: heic-to (WASM/Client-side conversion)
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
