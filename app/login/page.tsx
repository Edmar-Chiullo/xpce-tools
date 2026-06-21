'use client'

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()
    const [registrationNumber, setRegistrationNumber] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setLoading(true)

        const result = await signIn("credentials", {
            registrationNumber,
            password,
            redirect: false,
        })

        setLoading(false)

        if (result?.error) {
            setError("Matrícula ou senha inválidos.")
            return
        }

        router.push("/pages")
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-100">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg border border-zinc-200">
                <h1 className="text-2xl font-bold text-zinc-800 text-center mb-2">PCE Tools</h1>
                <p className="text-sm text-zinc-500 text-center mb-6">Faça login com sua matrícula</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="registrationNumber" className="block text-sm font-medium text-zinc-700 mb-1">
                            Matrícula
                        </label>
                        <input
                            id="registrationNumber"
                            type="text"
                            placeholder="Ex: 1036960"
                            value={registrationNumber}
                            onChange={(e) => setRegistrationNumber(e.target.value)}
                            required
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1">
                            Senha
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-950 text-white py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    )
}
