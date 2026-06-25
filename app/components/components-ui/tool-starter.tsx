'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ref, get } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"

interface ToolStarterProps {
    activityName: string
    formHref: string
}

export default function ToolStarter({ activityName, formHref }: ToolStarterProps) {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [hasOpenActivity, setHasOpenActivity] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storedKey, setStoredKey] = useState<string | null>(null)

    useEffect(() => {
        async function checkContinuity() {
            setLoading(true)

            // buscar no nó active-activities/{matricula} — O(1), sem varredura
            if (session?.user?.registrationNumber && status === "authenticated") {
                try {
                    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
                    const targetWords = normalize(activityName.replace(/-/g, ' ')).split(' ')
                    const activeSnap = await get(ref(db, `active-activities/${session.user.registrationNumber}`))

                    if (activeSnap.exists()) {
                        let foundKey = ''
                        activeSnap.forEach((child) => {
                            const data = child.val()
                            const storedName = normalize(data.activityName || '')
                            const allMatch = targetWords.every(tw => storedName.includes(tw))
                            if (allMatch) {
                                foundKey = child.key!
                                return true
                            }
                        })

                        if (foundKey) {
                            setStoredKey(foundKey)
                            setHasOpenActivity(true)
                            setLoading(false)
                            return
                        }
                    }
                } catch {}
            }

            setLoading(false)
        }

        checkContinuity()
    }, [activityName, session, status])

    function handleContinue() {
        if (storedKey) {
            sessionStorage.setItem(`active_activity_key_${activityName}`, storedKey)
        }
        router.push(formHref)
    }

    function handleNew() {
        localStorage.removeItem(`activity_${activityName}`)
        sessionStorage.removeItem(`active_activity_key_${activityName}`)
        router.push(formHref)
    }

    if (loading) {
        return (
            <div className="flex flex-col gap-4 w-full h-full">
                <h2 className="text-lg text-zinc-600">Verificando atividade existente...</h2>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <h2 className="text-lg text-zinc-700">
                {hasOpenActivity ? "Você possui uma atividade em andamento." : "Nenhuma atividade em andamento."}
            </h2>

            {hasOpenActivity ? (
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleContinue}
                        className="w-full h-12 bg-emerald-600 text-white rounded-md text-lg font-medium hover:bg-emerald-700 active:bg-emerald-800 cursor-pointer"
                    >
                        Continuar Atividade
                    </button>
                    <button
                        onClick={handleNew}
                        className="w-full h-12 bg-zinc-950 text-white rounded-md text-lg font-medium hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer"
                    >
                        Iniciar Nova
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleNew}
                    className="w-full h-14 bg-zinc-950 text-white rounded-md text-xl font-medium hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer"
                >
                    Iniciar
                </button>
            )}
        </div>
    )
}
