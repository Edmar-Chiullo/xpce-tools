'use client'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, SubmitHandler } from 'react-hook-form'
import { toast } from 'react-toastify'

const PERMISSION_KEYS: Record<string, string> = {
    'Aux. Logistico': 'pce-operation',
    'Ana. Logistico': 'pce-analytics',
    'Ana. Logistico 2': 'pce-analytics2',
    'Gerente': 'gerente',
    'Admin': 'admin',
}

const ROLES = [
    { value: 'Aux. Logistico', label: 'Aux. Logística' },
    { value: 'Ana. Logistico', label: 'Ana. Logística' },
    { value: 'Ana. Logistico 2', label: 'Ana. Logística 2' },
    { value: 'Gerente', label: 'Gerente' },
    { value: 'Admin', label: 'Admin' },
]

const ROLE_HIERARCHY: Record<string, number> = {
    'pce-operation': 0,
    'pce-analytics': 1,
    'pce-analytics2': 2,
    'gerente': 3,
    'admin': 4,
}

function reversePermission(perm: string): string {
    for (const [role, key] of Object.entries(PERMISSION_KEYS)) {
        if (key === perm) return role
    }
    return 'Aux. Logistico'
}

function middleNames(words: string[]) {
    const meddlesNames = words.slice(1, -1)
    return meddlesNames
        .filter(p => p.length > 2)
        .map(p => p[0].toUpperCase() + '.')
        .join(' ')
}

function firstLastName(fullName: string) {
    const words = fullName.trim().split(/\s+/)
    if (words.length <= 1) return fullName
    const firstName = words[0]
    const middleName = middleNames(words)
    const lastName = words[words.length - 1]
    return `${firstName} ${middleName} ${lastName}`
}

const baseSchema = {
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    registrationNumber: z.string().regex(/^\d{7}$/, "Matrícula deve ter exatamente 7 dígitos."),
    role: z.enum(['Aux. Logistico', 'Ana. Logistico', 'Ana. Logistico 2', 'Gerente', 'Admin']),
    center: z.string().min(1, "O centro de trabalho é obrigatório."),
}

const createSchema = z.object({
    ...baseSchema,
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
})

const editSchema = z.object({
    ...baseSchema,
    password: z.string().optional(),
})

type CreateFormData = z.infer<typeof createSchema>
type EditFormData = z.infer<typeof editSchema>

interface EditUserData {
    id: string
    registrationNumber: string
    userName: string
    userPermission: string
    center: string
}

interface CreateUserFormProps {
    editUser?: EditUserData
    onSuccess?: () => void
    onCancel?: () => void
    currentUserPermission?: string
}

export default function CreateUser({ editUser, onSuccess, onCancel, currentUserPermission }: CreateUserFormProps) {
    const isEdit = !!editUser
    const currentLevel = ROLE_HIERARCHY[currentUserPermission || ''] ?? 4

    const availableRoles = ROLES.filter((role) => {
        const roleKey = PERMISSION_KEYS[role.value]
        const roleLevel = ROLE_HIERARCHY[roleKey] ?? -1
        return roleLevel <= currentLevel
    })

    const schema = isEdit ? editSchema : createSchema
    type FormData = z.infer<typeof schema>

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: editUser?.userName || '',
            registrationNumber: editUser?.registrationNumber || '',
            role: editUser ? (reversePermission(editUser.userPermission) as any) : 'Aux. Logistico',
            center: editUser?.center || '',
            password: '',
        },
    })

    const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            const permission = PERMISSION_KEYS[data.role] || 'pce-operation'

            if (isEdit && editUser) {
                const body: Record<string, any> = {
                    id: editUser.id,
                    registrationNumber: data.registrationNumber,
                    userName: firstLastName(data.name),
                    userPermission: permission,
                    center: data.center,
                }
                if (data.password) {
                    body.password = data.password
                }

                const res = await fetch('/api/users', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })
                const result = await res.json()
                if (!res.ok) throw new Error(result.error)

                toast.success('Usuário atualizado com sucesso!')
            } else {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        registrationNumber: data.registrationNumber,
                        userName: firstLastName(data.name),
                        userPermission: permission,
                        userLocalWork: data.center,
                        center: data.center,
                        password: data.password,
                    }),
                })
                const result = await res.json()
                if (!res.ok) throw new Error(result.error)

                toast.success('Usuário cadastrado com sucesso!')
            }

            reset()
            onSuccess?.()
        } catch (error) {
            toast.error('Erro: ' + error)
        }
    }

    const inputClass = "w-full border border-zinc-300 rounded-lg px-3 py-2 text-zinc-800 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-950"

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label htmlFor="name" className="block mb-1 font-medium text-zinc-700 text-sm">Nome</label>
                <input
                    id="name"
                    type="text"
                    placeholder="Nome completo"
                    {...register("name")}
                    className={inputClass}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <label htmlFor="registrationNumber" className="block mb-1 font-medium text-zinc-700 text-sm">Matrícula</label>
                <input
                    id="registrationNumber"
                    type="text"
                    placeholder="Ex: 1036960"
                    {...register("registrationNumber")}
                    className={inputClass}
                />
                {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>}
            </div>

            <div>
                <label className="block mb-1 font-medium text-zinc-700 text-sm">Função</label>
                <div className="border border-zinc-300 rounded-lg p-3 bg-zinc-50">
                    <div className="flex flex-wrap gap-4">
                        {availableRoles.map(role => (
                            <div key={role.value} className="flex items-center gap-2">
                                <input
                                    id={`role-${role.value}`}
                                    type="radio"
                                    value={role.value}
                                    {...register("role")}
                                    className="w-4 h-4 text-zinc-900 border-gray-300"
                                />
                                <label htmlFor={`role-${role.value}`} className="font-medium text-zinc-700 text-sm">{role.label}</label>
                            </div>
                        ))}
                    </div>
                </div>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>}
            </div>

            <div>
                <label htmlFor="center" className="block mb-1 font-medium text-zinc-700 text-sm">Centro de Trabalho</label>
                <input
                    id="center"
                    type="text"
                    placeholder="Centro (Ex: 1046)"
                    {...register("center")}
                    className={inputClass}
                />
                {errors.center && <p className="text-red-500 text-sm mt-1">{errors.center.message}</p>}
            </div>

            <div>
                <label htmlFor="password" className="block mb-1 font-medium text-zinc-700 text-sm">
                    {isEdit ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                </label>
                <input
                    id="password"
                    type="password"
                    placeholder={isEdit ? "Deixe em branco para manter a atual" : "Senha"}
                    {...register("password")}
                    className={inputClass}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors cursor-pointer ${isSubmitting ? 'bg-zinc-600 cursor-not-allowed' : 'bg-zinc-950 hover:bg-zinc-800'}`}
                >
                    {isSubmitting ? 'Aguarde...' : isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
                </button>
            </div>
        </form>
    )
}
