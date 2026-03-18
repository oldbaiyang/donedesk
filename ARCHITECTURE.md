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

## 3. 权限与角色模型: RBAC Lite
项目实现了基于 `profiles` 表的轻量级权限控制：
- **Parent (家长)**：作为管理员，具备所属 `parent_id` 下所有任务的 `CRUD` 权限。
- **Student (学生)**：支持“自建任务”的完全控制；对于家长创建的任务，仅开放 `Submission` (备注及附件上传) 权限。
- **实现细节**：在 `AssignmentDetailDialog` 中通过 `isCreator` 与 `isParent` 布尔值进行 UI 按钮的动态挂载与逻辑拦截。

## 4. 附件分类索引: Material vs Submission
为了区分“任务要求”与“作业成果”，`attachments` 表引入了 `purpose` 字段：
- **Material**：关联任务主体展示。
- **Submission**：关联交作业区展示，支持学生多次提交。
- **图片压缩管道**：调用 `browser-image-compression`，在上传 Storage 前将原始大图压至 1MB 以内，大幅提升移动端加载体验。

## 5. 加载性能与视觉平滑度
- **双重加载锁**：`AssignmentsProvider` 启动时强制进入 `loading` 态，并与 `UserProvider` 的身份校验逻辑同步，彻底解决了刷新瞬间“空状态”内容的瞬时闪烁。
- **Skeleton 占位**：Dashboard 与 Assignments 页面均实现脉冲动画骨架屏，确保数据未就绪时布局不崩塌。

## 6. HEIC 转换管道 (Client-Side HEIC Strategy)
为了解决 iOS 设备上传 HEIC 图片导致其他端无法预览的问题，系统集成了 `heic-to`。
- **转换逻辑**：在 `PendingFilePreview` (预览) 和 `AssignmentsProvider` (上传) 中采用动态导入，利用浏览器 WASM 环境将 HEIC 转为 JPEG。
- **存储优化**：转换后文件重命名为 `.jpg`，并在 Supabase 中存储为 `image/jpeg` 类型，实现全平台 CDN 级别的渲染兼容。

## 7. 学科分类筛选 (Subject Filtering Logic)
- **状态管理**：在 `Dashboard` 与 `AssignmentsPage` 中维护 `selectedSubjectId` 状态。
- **前端过滤**：采用全量获取 + 前端实时过滤的策略，直接基于内存数据筛选，提供极致的响应速度。

## 8. 后续开发建议
- **积分反馈动画**：目前积分结算为瞬时变更，建议增加类似“金币弹出”的 Lottie 或 CSS 关键帧动画增加成就感。
- **全局通知**：集成 `sonner` 或 `toast` 处理跨组件的数据变更反馈。
