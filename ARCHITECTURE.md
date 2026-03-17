# DoneDesk 系统架构说明文档

本文档旨在为开发人员提供 DoneDesk 的核心技术架构、数据流转逻辑及设计规范的深度解读。

---

## 🏗️ 核心架构

DoneDesk 采用典型的 **前端驱动 + Serverless 后端** 架构：

### 1. 技术栈选型
- **Next.js 15 (App Router)**: 提供高性能的端到端路由与渲染。
- **Supabase**: 集成了 PostgreSQL (数据库)、Storage (附件存储) 与 Auth (身份认证)。
- **Hook-based Logic**: 业务逻辑高度封装于自定义 Hooks 中，实现 UI 与逻辑的彻底解耦。

---

## 🧬 数据流转与业务逻辑

项目核心逻辑主要由两个领域 Hook 承载：

### `useAssignments.ts` (任务领域)
- **状态维护**：维护 `assignments` 列表、`subjects` 列表。
- **核心能力**：
  - `addAssignment`: 事务化处理任务创建、附件上传与记录关联。
  - `toggleStatus`: 处理任务完成状态切换，并实时同步至 Supabase。
  - `uploadAttachment`: 封装了 Supabase Storage 的分块上传逻辑。

### `useRewards.ts` (奖励领域)
- **积分计算**：基于任务完成情况实时聚合当前用户的可用积分。
- **兑换流**：确保积分扣减与兑换历史记录的原子性操作。

---

## 🎨 UI 设计规范与交互特征

### 1. 拟态视觉 (Glassmorphism)
项目大量使用 `backdrop-blur-3xl` 与半透明 `bg-card/95`。
- **规范**：所有弹窗组件需保持视觉一致性，背景色统一采用 `bg-card/x` 系列 Token。

### 2. 关键交互修复 (Caveats)
- **事件冒泡阻断**：由于 `AssignmentDetailDialog` 曾嵌套在 `AssignmentCard` 中，导致点击关闭按钮时冒泡触发了 Card 的开启逻辑。
  - **解决方案**：目前在 `AssignmentCard.tsx` 中，使用 Fragment 将弹窗与卡片平级排列，从物理层面上切断合成事件的冒泡路径。

---

## 💾 数据库 Schema 概览

| 表名 | 描述 | 核心字段 |
| :--- | :--- | :--- |
| `profiles` | 用户扩展信息 | `id`, `user_name`, `total_points` |
| `subjects` | 学科分类 | `id`, `name`, `color_code` |
| `assignments` | 任务主表 | `id`, `title`, `description`, `reward_pts`, `status` |
| `attachments` | 任务附件 | `id`, `assignment_id`, `file_url`, `file_name` |
| `redeem_history` | 奖励兑换记录 | `id`, `reward_name`, `points_spent` |

---

## 🛠️ 后续开发建议

1. **缓存策略**：目前采用全量客户端拉取，随着任务量增大，建议引入 `React Query` 进行分段缓存管理。
2. **性能优化**：弹窗组件目前已实现按需加载，后期可进一步优化附件预览的加载优先级。
