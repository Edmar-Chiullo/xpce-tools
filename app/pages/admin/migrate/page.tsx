'use client'

import { useState } from "react"
import { useSession } from "next-auth/react"

interface PreviewEntry {
    date: string
    center: string
    activityName: string
    activityId: string
    tasksCount: number
}

interface ScanResult {
    entries: PreviewEntry[]
    totalActivities: number
    totalTasks: number
    dates: string[]
    centers: string[]
}

interface MigrationProgress {
    [date: string]: 'pending' | 'running' | 'done' | 'error'
}

export default function MigratePage() {
    const { data: session } = useSession()
    const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null)
    const [progress, setProgress] = useState("")
    const [running, setRunning] = useState(false)
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [migProgress, setMigProgress] = useState<MigrationProgress>({})

    const isAdmin = session?.user?.permission === "admin"

    async function handleScan() {
        setRunning(true)
        setStatus(null)
        setScanResult(null)
        setProgress("Escaneando dados antigos...")

        try {
            const res = await fetch('/api/migrate')
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Erro no escaneamento")
            }
            const result: ScanResult = await res.json()
            setScanResult(result)
            const init: MigrationProgress = {}
            result.dates.forEach(d => { init[d] = 'pending' })
            setMigProgress(init)
            setStatus({
                message: `Escaneamento concluído: ${result.totalActivities} atividades e ${result.totalTasks} tarefas encontradas em ${result.dates.length} data(s) e ${result.centers.length} centro(s).`,
                type: 'info',
            })
        } catch (err) {
            setStatus({ message: `Erro no escaneamento: ${err}`, type: 'error' })
        }

        setRunning(false)
    }

    async function migrateSingleDate(date: string) {
        setMigProgress(prev => ({ ...prev, [date]: 'running' }))
        setProgress(`Migrando ${date}...`)

        try {
            const res = await fetch('/api/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || `Erro ao migrar ${date}`)
            }

            setMigProgress(prev => ({ ...prev, [date]: 'done' }))
            return data
        } catch (err) {
            setMigProgress(prev => ({ ...prev, [date]: 'error' }))
            throw err
        }
    }

    async function runMigrationAll() {
        if (!scanResult) return
        setRunning(true)
        setStatus(null)

        let totalActivities = 0
        let totalTasks = 0
        let errors: string[] = []

        for (const date of scanResult.dates) {
            try {
                const data = await migrateSingleDate(date)
                totalActivities += data.activitiesMigrated || data.activities || 0
                totalTasks += data.tasksMigrated || data.tasks || 0
            } catch (err) {
                errors.push(`${date}: ${err}`)
            }
        }

        setRunning(false)
        setProgress("")

        if (errors.length === 0) {
            setStatus({
                message: `Migração concluída! ${totalActivities} atividades e ${totalTasks} tarefas migradas.`,
                type: 'success',
            })
        } else {
            setStatus({
                message: `Migração parcial. ${totalActivities} atividades e ${totalTasks} tarefas migradas. ${errors.length} erro(s): ${errors.join('; ')}`,
                type: 'error',
            })
        }
    }

    async function handleMigrateDate(date: string) {
        setRunning(true)
        setStatus(null)
        try {
            await migrateSingleDate(date)
            setStatus({ message: `Data ${date} migrada com sucesso.`, type: 'success' })
        } catch (err) {
            setStatus({ message: `Erro ao migrar ${date}: ${err}`, type: 'error' })
        }
        setRunning(false)
        setProgress("")
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500 text-lg">Acesso restrito a administradores.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-800">Migrar Dados</h1>
            <p className="text-zinc-600">
                Esta página migra os dados da estrutura antiga (aninhada por data) para a nova estrutura
                (activities + tasks flat).
            </p>

            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-amber-800 text-sm">
                <strong>Atenção:</strong> A migração pode duplicar dados se executada mais de uma vez.
                Verifique se os nós <code>activities</code> e <code>tasks</code> estão vazios antes de prosseguir.
            </div>

            <div className="flex gap-4 items-center flex-wrap">
                <button
                    onClick={handleScan}
                    disabled={running}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {running ? "Escaneando..." : "1. Escanear Dados"}
                </button>

                <button
                    onClick={runMigrationAll}
                    disabled={running || !scanResult || scanResult.dates.length === 0}
                    className="px-6 py-3 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {running ? "Migrando..." : "2. Migrar Todas as Datas"}
                </button>
            </div>

            {scanResult && (
                <div className="bg-green-50 border border-green-300 rounded-lg p-4 text-green-800 text-sm">
                    <strong>Resumo do escaneamento:</strong>
                    <ul className="list-disc list-inside mt-1">
                        <li>{scanResult.totalActivities} atividades encontradas</li>
                        <li>{scanResult.totalTasks} tarefas encontradas</li>
                        <li>{scanResult.dates.length} data(s)</li>
                        <li>{scanResult.centers.length} centro(s)</li>
                    </ul>
                </div>
            )}

            {scanResult && scanResult.dates.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-zinc-800">
                        Migrar por Data
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {scanResult.dates.map((date) => {
                            const st = migProgress[date]
                            const isRunning = st === 'running'
                            const isDone = st === 'done'
                            const isError = st === 'error'
                            return (
                                <button
                                    key={date}
                                    onClick={() => handleMigrateDate(date)}
                                    disabled={running || isDone}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border
                                        ${isDone ? 'bg-green-100 text-green-700 border-green-300 cursor-default' :
                                          isError ? 'bg-red-100 text-red-700 border-red-300' :
                                          isRunning ? 'bg-blue-100 text-blue-700 border-blue-300 cursor-wait' :
                                          'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'}`}
                                >
                                    {isDone ? '✓' : isError ? '✗' : ''} {date}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {progress && (
                <p className="text-sm text-zinc-500 font-mono">{progress}</p>
            )}

            {status && (
                <div className={`p-4 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' :
                        status.type === 'error' ? 'bg-red-50 text-red-800 border border-red-300' :
                            'bg-blue-50 text-blue-800 border border-blue-300'
                    }`}>
                    {status.message}
                </div>
            )}

            {scanResult && scanResult.entries.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-semibold text-zinc-800">
                        Prévia dos dados ({scanResult.entries.length} atividades)
                    </h3>
                    <div className="max-h-80 overflow-y-auto border border-zinc-300 rounded-lg">
                        <table className="w-full text-sm text-zinc-800">
                            <thead className="bg-zinc-200 sticky top-0">
                                <tr>
                                    <th className="text-left p-2 whitespace-nowrap">Data</th>
                                    <th className="text-left p-2 whitespace-nowrap">Centro</th>
                                    <th className="text-left p-2 whitespace-nowrap">Atividade</th>
                                    <th className="text-left p-2 whitespace-nowrap">Código</th>
                                    <th className="text-left p-2 whitespace-nowrap">Tarefas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scanResult.entries.map((entry, i) => (
                                    <tr key={i} className="border-t border-zinc-200 hover:bg-zinc-100">
                                        <td className="p-2 whitespace-nowrap">{entry.date}</td>
                                        <td className="p-2 whitespace-nowrap">{entry.center}</td>
                                        <td className="p-2 whitespace-nowrap">{entry.activityName}</td>
                                        <td className="p-2 whitespace-nowrap">{entry.activityId}</td>
                                        <td className="p-2 whitespace-nowrap">{entry.tasksCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
