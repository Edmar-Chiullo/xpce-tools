'use client'

import { usePathname } from "next/navigation";
import Sidebar from "../components/components-ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const hideSidebar = pathname.startsWith("/pages/utilitarios");

  return (
    <div className="flex w-full min-h-dvh p-0 md:p-2 lg:p-3 lg:gap-3 bg-surface rounded-[var(--radius)]">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1 min-h-dvh lg:min-h-full overflow-auto max-w-full p-3 lg:p-0 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
