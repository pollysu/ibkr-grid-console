import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/nav/sidebar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "IBKR Grid Console",
  description: "Open-source frontend for an IBKR grid trading dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex bg-[var(--surface-secondary)]">
        <Sidebar />
        <main className="flex-1 min-w-0 flex flex-col bg-white">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
