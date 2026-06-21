'use client'

import { useMemo } from "react"
import { AtividadeProps } from "@/app/types/TasksProps"
import { Activity, Trophy, Clock } from "lucide-react"

interface KPICardsProps {
  tasks: AtividadeProps[]
}

function formatDuration(ms: number) {
  if (ms <= 0) return '-'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function KPICards({ tasks }: KPICardsProps) {
  const { total, topUser, avgDuration } = useMemo(() => {
    const userMap: Record<string, { count: number; totalDuration: number }> = {}
    let totalDuration = 0
    let finishedCount = 0

    for (const t of tasks) {
      if (t.activity?.activityState === false) {
        const user = t.activity.activtyUserName || 'Desconhecido'
        if (!userMap[user]) userMap[user] = { count: 0, totalDuration: 0 }
        userMap[user].count++
        const duration = Math.max(0, (t.activity.activityFinishDate || 0) - (t.activity.activityInitDate || 0))
        userMap[user].totalDuration += duration
        totalDuration += duration
        finishedCount++
      }
    }

    const sorted = Object.entries(userMap).sort((a, b) => b[1].count - a[1].count)
    const topUser = sorted.length > 0 ? {
      name: sorted[0][0],
      count: sorted[0][1].count,
    } : null

    return {
      total: tasks.length,
      topUser,
      avgDuration: finishedCount > 0 ? totalDuration / finishedCount : 0,
    }
  }, [tasks])

  const cards = [
    {
      icon: Activity,
      label: 'Total de Atividades',
      value: total,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Trophy,
      label: 'Top Performance',
      value: topUser ? `${topUser.name} (${topUser.count})` : '—',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Clock,
      label: 'Tempo Médio',
      value: formatDuration(avgDuration),
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ]

  return (
    <div className="flex gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="flex items-center gap-4 flex-1 bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border min-w-0"
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${card.bg}`}>
              <Icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-fg font-medium uppercase tracking-wider">{card.label}</p>
              <p className={`text-lg font-bold truncate ${card.color}`}>{card.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
