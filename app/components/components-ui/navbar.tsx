'use client'

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import clsx from "clsx";
import Link from "next/link";
import { useIdleLogout } from "@/app/hooks/useIdleLogout";
import { LayoutDashboard, ClipboardList, Wrench, Users, Settings, LogOut, Home, Printer, BookOpen } from "lucide-react";

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  permissions: string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: "/pages", label: "Início", icon: Home, permissions: ["admin", "gerente", "pce-analytics", "pce-operation"] },
  { href: "/pages/dashboard", label: "Dashboard", icon: LayoutDashboard, permissions: ["admin", "gerente", "pce-analytics"] },
  { href: "/pages/taskpainel", label: "Tarefas", icon: ClipboardList, permissions: ["admin", "gerente", "pce-analytics"] },
  { href: "/pages/kit-ferramentas", label: "Ferramentas", icon: Wrench, permissions: ["admin", "gerente", "pce-analytics", "pce-operation"] },
  { href: "/pages/utilitarios", label: "Utilitários", icon: Printer, permissions: ["admin", "gerente", "pce-analytics", "pce-operation"] },
  { href: "/pages/docs", label: "Documentação", icon: BookOpen, permissions: ["admin", "gerente", "pce-analytics", "pce-operation"] },
  { href: "/pages/users", label: "Usuários", icon: Users, permissions: ["admin", "gerente"] },
  { href: "/pages/admin/migrate", label: "Migração", icon: Settings, permissions: ["admin"] },
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  "pce-analytics": "Analista",
  "pce-operation": "Auxiliar",
}

export default function Navbar() {
  useIdleLogout()
  const pathname = usePathname()
  const { data: session } = useSession()

  const user = session?.user
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'
  const roleLabel = ROLE_LABELS[user?.permission || ''] || 'Operador'

  const visibleItems = NAV_ITEMS.filter(item =>
    item.permissions.includes(user?.permission || '')
  )

  return (
    <div className="flex flex-col h-full text-sidebar-fg">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold tracking-wider">PCE</h1>
        <p className="text-xs text-sidebar-muted mt-0.5">Tools</p>
      </div>

      <div className="flex items-center gap-3 px-2 py-3 mb-6 bg-white/5 rounded-xl">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-fg text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
          <p className="text-xs text-sidebar-muted">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {visibleItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/pages' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-white/10 text-sidebar-fg'
                  : 'text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-muted hover:text-sidebar-fg hover:bg-white/5 transition-colors mt-auto"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        <span>Sair</span>
      </button>
    </div>
  )
}
