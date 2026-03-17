"use client"

import { useEffect, useState } from "react";

// 单机版临时测试 UUID
const MOCK_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

export function useUser() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // 真实情况可接入 Supabase Auth
    // 此处由于单学生使用，直接给它一个固定不变的 UUID 或利用 LocalStorage 保持持久态
    let storedId = localStorage.getItem("donedesk_user_id");
    if (!storedId) {
       localStorage.setItem("donedesk_user_id", MOCK_USER_ID);
       storedId = MOCK_USER_ID;
    }
    setUserId(storedId);
  }, []);

  return { userId };
}
