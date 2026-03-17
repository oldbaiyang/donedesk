"use client"

import { useUserContext } from "@/providers/UserProvider"

/**
 * 身份钩子切换为 Context 消费模式。
 * 核心逻辑已迁移至 src/providers/UserProvider.tsx，以解决并发 Lock 冲突问题。
 */
export function useUser() {
  return useUserContext()
}
