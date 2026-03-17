import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["tiptap-markdown", "@tiptap/core", "@tiptap/react", "@tiptap/pm", "@tiptap/starter-kit"]
};

export default nextConfig;
