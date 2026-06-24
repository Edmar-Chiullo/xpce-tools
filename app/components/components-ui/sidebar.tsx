'use client'

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Navbar from "./navbar"
import { Menu, X } from "lucide-react"

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 flex items-center justify-center w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-sm border border-zinc-200 text-zinc-700 lg:hidden cursor-pointer"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-sidebar-bg p-4
          transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0 lg:min-h-full lg:rounded-[var(--radius)]
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <span className="text-lg font-bold text-sidebar-fg">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5 cursor-pointer"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Navbar />
      </aside>
    </>
  )
}
