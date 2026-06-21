interface CardProps {
  title: string
  description: string
  total: number
  active?: number
  finished?: number
}

export default function Card({ title, description, total, active, finished }: CardProps) {
  const pct = total > 0 && active !== undefined ? Math.round((active / total) * 100) : 0

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-md flex-1 min-w-[160px] max-w-[220px]">
      <h3 className="text-lg font-semibold text-zinc-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-xl font-bold text-zinc-800">{total}</p>
      {active !== undefined && finished !== undefined && (
        <div className="flex flex-col gap-1 mt-1">
          <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500">
            {pct}% ({active} ativas · {finished} finalizadas)
          </span>
        </div>
      )}
    </div>
  );
}
