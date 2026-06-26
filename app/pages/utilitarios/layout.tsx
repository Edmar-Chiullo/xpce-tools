'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function UtilitariosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isRoot = pathname === '/pages/utilitarios'

  return (
    <div className="w-full h-full p-4 md:p-6 max-w-full overflow-x-hidden">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={isRoot ? '/pages' : '/pages/utilitarios'}
          className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
      </div>
      {children}
    </div>
  )
}
