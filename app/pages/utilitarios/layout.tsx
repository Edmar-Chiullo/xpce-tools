'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ArrowLeft, LogOut } from 'lucide-react'

export default function UtilitariosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRoot = pathname === '/pages/utilitarios'

  return (
    <div className="w-full h-full p-4 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href={isRoot ? '/pages' : '/pages/utilitarios'}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-red-600 transition-colors cursor-pointer"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
      {children}
    </div>
  )
}
