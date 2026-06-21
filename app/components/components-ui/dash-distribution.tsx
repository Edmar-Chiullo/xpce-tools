'use client'

import { useMemo } from "react"
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { AtividadeProps } from "@/app/types/TasksProps"

ChartJS.register(ArcElement, Tooltip, Legend)

interface DistributionProps {
  tasks: AtividadeProps[]
}

const COLORS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
]

export default function DashDistribution({ tasks }: DistributionProps) {
  const { labels, data, total } = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tasks) {
      const name = t.activity?.activityName || 'Desconhecido'
      counts[name] = (counts[name] || 0) + 1
    }
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return {
      labels: entries.map(([name]) => name),
      data: entries.map(([, count]) => count),
      total: tasks.length,
    }
  }, [tasks])

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: COLORS.slice(0, labels.length),
        borderWidth: 0,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed as number
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0'
            return `${ctx.label}: ${val} (${pct}%)`
          },
        },
      },
    },
    cutout: '65%',
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border">
        <h3 className="text-sm font-semibold text-card-fg mb-3">Distribuição</h3>
        <p className="text-xs text-muted-fg">Sem dados.</p>
      </div>
    )
  }

  return (
    <div className="bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border">
      <h3 className="text-sm font-semibold text-card-fg mb-1">Distribuição</h3>
      <p className="text-xs text-muted-fg mb-4">Por tipo de atividade</p>
      <div className="h-48">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="flex flex-col gap-1.5 mt-4">
        {labels.map((label, i) => {
          const count = data[i]
          const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0'
          return (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-card-fg flex-1 truncate">{label}</span>
              <span className="text-muted-fg">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
