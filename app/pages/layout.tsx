import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "../components/components-ui/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PCE Tools",
  description: "Painel de gestão",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full h-screen p-3 gap-3 bg-surface rounded-[var(--radius)]">
      <aside className="flex flex-col w-64 min-h-full bg-sidebar-bg rounded-[var(--radius)] p-4 shrink-0">
        <Navbar />
      </aside>
      <main className="flex-1 min-h-full overflow-auto">
        {children}
      </main>
    </div>
  );
}
