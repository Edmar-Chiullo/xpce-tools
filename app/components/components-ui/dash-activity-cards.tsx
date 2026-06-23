'use client'

import Link from "next/link"
import { ClipboardList, Warehouse, ScanLine, Plane } from "lucide-react"
import { AtividadeProps } from "@/app/types/TasksProps"

interface DashActivityCardsProps {
  tasks: AtividadeProps[]
  selectedDate: string
}

const FILTER_MAP: Record<string, (name: string) => boolean> = {
  quarentena: (name) => name.includes('quarentena'),
  picking: (name) => name.includes('picking') || name.includes('rotativo'),
  endereco: (name) => name.includes('endereço') || name.includes('endereco') || name.includes('produto'),
  aereo: (name) => name.includes('aéreo') || name.includes('aereo'),
}

const CARDS_CONFIG = [
  { key: 'quarentena', label: 'Quarentena Fracionada', icon: ClipboardList, href: 'quarentena-fracionada', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { key: 'picking', label: 'Rotativo de Picking', icon: Warehouse, href: 'rotativo-picking', color: 'text-blue-500', bg: 'bg-blue-50' },
  { key: 'endereco', label: 'Validação End x Prod', icon: ScanLine, href: 'validacao-produto-endereco', color: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'aereo', label: 'Aéreo Vazio', icon: Plane, href: 'aereo-vazio', color: 'text-rose-500', bg: 'bg-rose-50' },
] as const

export default function DashActivityCards({ tasks, selectedDate }: DashActivityCardsProps) {
  function countByType(filterKey: string) {
    const fn = FILTER_MAP[filterKey]
    if (!fn) return 0
    return tasks.filter(t => fn(t.activity?.activityName?.toLowerCase() || '')).length
  }

  return (
    <div className="flex gap-4">
      {CARDS_CONFIG.map((card) => {
        const Icon = card.icon
        const count = countByType(card.key)
        return (
          <Link
            key={card.key}
            href={`/pages/dashboard/${card.href}?date=${selectedDate}`}
            className="flex items-center gap-4 flex-1 bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border min-w-0 hover:shadow-md transition-shadow"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${card.bg}`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-fg font-medium uppercase tracking-wider">{card.label}</p>
              <p className={`text-lg font-bold truncate ${card.color}`}>{count} tarefa{count !== 1 ? 's' : ''}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
