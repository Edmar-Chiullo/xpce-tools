'use client'

import { useMemo } from "react"
import { AtividadeProps } from "@/app/types/TasksProps"
import { Clock } from "lucide-react"

interface FeedProps {
  tasks: AtividadeProps[]
}

function timeAgo(ts: number) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const COLORS = [
  'bg-primary text-primary-fg',
  'bg-amber-500 text-white',
  'bg-blue-500 text-white',
  'bg-rose-500 text-white',
  'bg-violet-500 text-white',
]

export default function DashFeed({ tasks }: FeedProps) {
  const recent = useMemo(() => {
    return [...tasks]
      .sort((a, b) => (b.activity?.activityInitDate || 0) - (a.activity?.activityInitDate || 0))
      .slice(0, 10)
  }, [tasks])

  if (recent.length === 0) {
    return (
      <div className="bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border">
        <h3 className="text-sm font-semibold text-card-fg mb-3">Atividades Recentes</h3>
        <p className="text-xs text-muted-fg">Nenhuma atividade recente.</p>
      </div>
    )
  }

  return (
    <div className="bg-card-bg rounded-[var(--radius)] p-5 shadow-sm border border-border">
      <h3 className="text-sm font-semibold text-card-fg mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        Atividades Recentes
      </h3>
      <div className="flex flex-col gap-3">
        {recent.map((t) => {
          const name = t.activity?.activtyUserName || '—'
          const colorClass = COLORS[name.length % COLORS.length]
          return (
            <div key={t._firebaseKey} className="flex items-start gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0 ${colorClass}`}>
                {getInitials(name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-fg truncate">{name}</p>
                <p className="text-xs text-muted-fg truncate">{t.activity?.activityName || '—'}</p>
              </div>
              <span className="text-xs text-muted-fg whitespace-nowrap shrink-0">
                {timeAgo(t.activity?.activityInitDate)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
