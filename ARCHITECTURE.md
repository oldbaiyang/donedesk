# 技术架构与开发指南 (ARCHITECTURE.md)

本文档记录了 DoneDesk 的核心技术决策与实现细节，供后续迭代参考。

## 1. 编辑器架构: Live Preview Fusion
项目弃用了传统的分栏预览，采用了基于 **Tiptap V2** 的融合编辑方案。
- **配置要点**：
  - 使用 `tiptap-markdown` 进行 Markdown 数据同步。
  - 针对 Turbopack 兼容性，编辑器组件必须通过 `next/dynamic(..., { ssr: false })` 加载。
  - **避坑指南**：Tiptap 会对 Markdown 关键字进行转义（如 `!\[\]`）。渲染端需使用预处理函数 `cleanMarkdown` 剥离转义反斜杠，否则图片无法渲染。

## 2. 渲染引擎与交互
详情页渲染采用 `react-markdown` v10：
- **插件组合**：`remark-gfm` (链接识别), `remark-breaks` (同步换行)。
- **布局补丁**：将 `p` 标签覆写为 `div` 渲染，以支持在段落内嵌入 `Dialog` (用于图片放大) 而不产生 HTML 嵌套报错。
- **图片规格**：
  - 详情页：`200x200` 规格，`inline-block` 布局。
  - 卡片预览：正则提取 Markdown 中的图片 URL，仅在无文本时渲染缩略图。

## 3. 数据库结构 (Supabase)
目前 `assignments` 表核心字段：
- `start_date` (timestamp): 任务起始时间（新增字段）。
- `due_date` (timestamp): 截止时间。
- `description` (text): 存储 Tiptap 产出的 Markdown 字符串。
- `reward_pts` (integer): 任务分值。

## 4. 水合安全性 (Hydration)
由于浏览器扩展或开发工具可能注入 `style` 属性，全局 `html` 标签必须包含 `suppressHydrationWarning`，以防止 React 水合失败。

## 5. 后续开发建议
- **图片上传**：目前图片渲染依赖外部 URL，后续应集成 Supabase Storage 实现直接拖拽上传至 Tiptap。
- **移动端适配**：需针对 `200x200` 的横排图片在窄屏下的折行行为进行进一步媒体查询优化。
