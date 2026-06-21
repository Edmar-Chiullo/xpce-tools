'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SeedPage() {
    const router = useRouter()
    const [hasUsers, setHasUsers] = useState<boolean | null>(null)
    const [registrationNumber, setRegistrationNumber] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [center, setCenter] = useState("1046")
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/seed')
            .then(res => res.json())
            .then(data => setHasUsers(data.hasUsers))
            .catch(() => setHasUsers(false))
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setStatus(null)

        try {
            const res = await fetch('/api/seed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ registrationNumber, name, center, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setStatus({ message: data.error || "Erro ao criar admin.", type: 'error' })
                setLoading(false)
                return
            }

            setStatus({ message: "Admin criado com sucesso! Redirecionando...", type: 'success' })
            setTimeout(() => router.push("/login"), 2000)
        } catch {
            setStatus({ message: "Erro de conexão com o servidor.", type: 'error' })
        }

        setLoading(false)
    }

    if (hasUsers === null) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-100">
                <p className="text-zinc-500">Verificando...</p>
            </div>
        )
    }

    if (hasUsers) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-100">
                <div className="text-center">
                    <p className="text-zinc-600 mb-4">Já existem usuários cadastrados.</p>
                    <a href="/login" className="text-zinc-950 underline">Ir para o login</a>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-100">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg border border-zinc-200">
                <h1 className="text-2xl font-bold text-zinc-800 text-center mb-2">Criar Admin Inicial</h1>
                <p className="text-sm text-zinc-500 text-center mb-6">Nenhum usuário encontrado. Crie o primeiro administrador.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Matrícula</label>
                        <input type="text" placeholder="Ex: 1036960" value={registrationNumber}
                            onChange={e => setRegistrationNumber(e.target.value)} required
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Nome</label>
                        <input type="text" placeholder="Nome completo" value={name}
                            onChange={e => setName(e.target.value)} required
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Centro</label>
                        <input type="text" placeholder="Ex: 1046" value={center}
                            onChange={e => setCenter(e.target.value)} required
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Senha</label>
                        <input type="password" placeholder="Senha" value={password}
                            onChange={e => setPassword(e.target.value)} required
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800" />
                    </div>

                    {status && (
                        <p className={`text-sm text-center ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                            {status.message}
                        </p>
                    )}

                    <button type="submit" disabled={loading}
                        className="w-full bg-zinc-950 text-white py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                        {loading ? "Criando..." : "Criar Admin"}
                    </button>
                </form>
            </div>
        </div>
    )
}
