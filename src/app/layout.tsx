import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoneDesk - 最强学生作业管理",
  description: "拒绝遗忘，防零散的任务和附件沉淀打卡系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/20 bg-background text-foreground`}
      >
        <div className="flex h-screen overflow-hidden bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
          {/* 玻璃感网点装饰背景 */}
          <div className="absolute inset-0 z-[-1] bg-[url('https://api.typedream.com/v0/document/public/8c34614a-5c2f-4886-abe8-06ccfbf9a63c/r4m4p8H2XvL7C70Hpwl8Xg8W06H.svg')] opacity-[0.4] bg-[length:24px_24px]"></div>

          <Navigation />
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:pl-64 relative z-0 scroll-smooth">
            <div className="container p-4 md:p-8 lg:p-12 max-w-6xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
