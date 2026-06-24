'use client'

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Plus, Pencil, Ban, CheckCircle, Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import CreateUserForm from "@/app/components/components-ui/form-cadastro/form-cadastro-user"

const PERMISSION_MAP: Record<string, string> = {
    admin: "Admin",
    gerente: "Gerente",
    "pce-analytics": "Analista",
    "pce-operation": "Auxiliar",
}

const PERMISSION_LEVELS = [
    { value: "", label: "Todas as funções" },
    { value: "admin", label: "Admin" },
    { value: "gerente", label: "Gerente" },
    { value: "pce-analytics", label: "Analista" },
    { value: "pce-operation", label: "Auxiliar" },
]

interface UserData {
    id: string
    registrationNumber: string
    userName: string
    userPermission: string
    userLocalWork: string
    center: string
    userRegistrationDate: string
    userActive: boolean
}

const ITEMS_PER_PAGE = 7

export default function UsersPage() {
    const { data: session } = useSession()
    const isAdmin = session?.user?.permission === "admin" || session?.user?.permission === "gerente"

    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [permissionFilter, setPermissionFilter] = useState("")
    const [activeFilter, setActiveFilter] = useState("true")
    const [currentPage, setCurrentPage] = useState(1)
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState<UserData | null>(null)

    const [confirmTarget, setConfirmTarget] = useState<UserData | null>(null)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (permissionFilter) params.set('permission', permissionFilter)
            if (activeFilter) params.set('active', activeFilter)
            params.set('limit', '999')

            const res = await fetch(`/api/users?${params}`)
            const data = await res.json()
            if (res.ok) {
                setUsers(data.users || [])
            }
        } catch {
            setStatusMsg({ type: 'error', text: 'Erro ao carregar usuários.' })
        }
        setLoading(false)
    }, [search, permissionFilter, activeFilter])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const filtered = useMemo(() => {
        const term = search.toLowerCase()
        return users.filter(u =>
            !term || u.userName.toLowerCase().includes(term) || u.registrationNumber.toLowerCase().includes(term)
        )
    }, [users, search])

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
    const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    useEffect(() => {
        setCurrentPage(1)
    }, [search, permissionFilter, activeFilter])

    function showMsg(type: 'success' | 'error', text: string) {
        setStatusMsg({ type, text })
        setTimeout(() => setStatusMsg(null), 4000)
    }

    async function handleToggleActive(user: UserData) {
        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id, userActive: !user.userActive }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            showMsg('success', data.message)
            setConfirmTarget(null)
            fetchUsers()
        } catch (err) {
            showMsg('error', `Erro: ${err}`)
            setConfirmTarget(null)
        }
    }

    function handleEdit(user: UserData) {
        setEditingUser(user)
        setShowForm(true)
    }

    function handleNewUser() {
        setEditingUser(null)
        setShowForm(true)
    }

    function handleFormClose() {
        setShowForm(false)
        setEditingUser(null)
        fetchUsers()
    }

    const permLabel = (p: string) => PERMISSION_MAP[p] || p

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-red-500 text-lg">Acesso restrito a administradores e gerentes.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-zinc-800">Usuários</h1>
                <button
                    onClick={handleNewUser}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Novo Usuário</span>
                </button>
            </div>

            <div className="flex gap-3 items-center">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nome ou matrícula..."
                        className="w-full pl-9 pr-3 py-2 border border-zinc-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                    {search && (
                        <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                            <X className="w-4 h-4 text-zinc-400 hover:text-zinc-600" />
                        </button>
                    )}
                </div>

                <select
                    value={permissionFilter}
                    onChange={e => setPermissionFilter(e.target.value)}
                    className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950"
                >
                    {PERMISSION_LEVELS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>

                <select
                    value={activeFilter}
                    onChange={e => setActiveFilter(e.target.value)}
                    className="border border-zinc-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950"
                >
                    <option value="true">Ativos</option>
                    <option value="">Todos</option>
                    <option value="false">Inativos</option>
                </select>
            </div>

            {statusMsg && (
                <div className={`p-3 rounded-lg text-sm ${statusMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-300' : 'bg-red-50 text-red-800 border border-red-300'}`}>
                    {statusMsg.text}
                </div>
            )}

            <div className="border border-zinc-300 rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-zinc-200">
                        <tr>
                            <th className="text-left p-3 whitespace-nowrap">Matrícula</th>
                            <th className="text-left p-3 whitespace-nowrap">Nome</th>
                            <th className="text-left p-3 whitespace-nowrap">Função</th>
                            <th className="text-left p-3 whitespace-nowrap">Centro</th>
                            <th className="text-left p-3 whitespace-nowrap">Status</th>
                            <th className="text-left p-3 whitespace-nowrap">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-zinc-500">Carregando...</td>
                            </tr>
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-zinc-500">Nenhum usuário encontrado.</td>
                            </tr>
                        ) : paginated.map((user) => (
                            <tr key={user.id} className="border-t border-zinc-200 hover:bg-zinc-50">
                                <td className="p-3 whitespace-nowrap font-mono">{user.registrationNumber}</td>
                                <td className="p-3 whitespace-nowrap">{user.userName}</td>
                                <td className="p-3 whitespace-nowrap">{permLabel(user.userPermission)}</td>
                                <td className="p-3 whitespace-nowrap">{user.center}</td>
                                <td className="p-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.userActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {user.userActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-1.5 rounded-md text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setConfirmTarget(user)}
                                            className={`p-1.5 rounded-md transition-colors ${user.userActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
                                            title={user.userActive ? 'Desativar' : 'Ativar'}
                                        >
                                            {user.userActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-zinc-300 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-zinc-600">
                        {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-zinc-300 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-zinc-800">
                                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-1 rounded-md hover:bg-zinc-100">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <CreateUserForm
                            editUser={editingUser ? {
                                id: editingUser.id,
                                registrationNumber: editingUser.registrationNumber,
                                userName: editingUser.userName,
                                userPermission: editingUser.userPermission,
                                center: editingUser.center,
                            } : undefined}
                            onSuccess={handleFormClose}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            {confirmTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
                        <h2 className="text-lg font-bold text-zinc-900">
                            {confirmTarget.userActive ? 'Desativar Usuário' : 'Ativar Usuário'}
                        </h2>
                        <p className="mt-2 text-zinc-600 text-sm">
                            {confirmTarget.userActive
                                ? `Tem certeza que deseja desativar o usuário ${confirmTarget.userName}?`
                                : `Tem certeza que deseja ativar o usuário ${confirmTarget.userName}?`
                            }
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => setConfirmTarget(null)}
                                className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-800 hover:bg-zinc-300 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleToggleActive(confirmTarget)}
                                className={`px-4 py-2 rounded-lg text-white cursor-pointer ${confirmTarget.userActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            >
                                {confirmTarget.userActive ? 'Desativar' : 'Ativar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
