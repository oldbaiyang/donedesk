"use client"

import React, { useState, useEffect } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/Navigation";
import { AssignmentsProvider } from "@/providers/AssignmentsProvider";
import { useUser } from "@/hooks/useUser";
import { UserProvider } from "@/providers/UserProvider";
import AuthPage from "./auth/page";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/20 bg-background text-foreground`}
      >
        <UserProvider>
          <AssignmentsProvider>
            <AuthWrapper>{children}</AuthWrapper>
          </AssignmentsProvider>
        </UserProvider>
      </body>
    </html>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useUser();
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowTimeoutWarning(true);
        console.warn("Auth initialization is taking longer than expected...");
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background gap-4">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-2 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center font-black text-primary italic text-xl">D</div>
        </div>
        {showTimeoutWarning && (
          <p className="text-xs text-muted-foreground animate-pulse font-medium">
            网络连接同步中，请稍候...
          </p>
        )}
      </div>
    );
  }

  if (!user && !profile) {
    return <AuthPage />;
  }

  return (
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
  );
}
