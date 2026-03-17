import { redirect } from "next/navigation";

export default function Home() {
  // 简易处理：一旦访问着陆页，立刻进入正式系统内部
  redirect("/dashboard");
}
