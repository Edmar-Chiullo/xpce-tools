import Sidebar from "../components/components-ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex w-full min-h-dvh p-0 lg:p-3 lg:gap-3 bg-surface rounded-[var(--radius)]">
      <Sidebar />
      <main className="flex-1 min-h-dvh lg:min-h-full overflow-auto p-3 lg:p-0 lg:ml-0">
        {children}
      </main>
    </div>
  );
}
