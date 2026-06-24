'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ref, get, child, query, orderByChild, equalTo } from "firebase/database"
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

            const localKey = localStorage.getItem(`activity_${activityName}`)

            if (localKey) {
                try {
                    const snap = await get(child(ref(db), `activities/${localKey}`))
                    if (snap.exists()) {
                        const data = snap.val()
                        if (data.activityState === true) {
                            setStoredKey(localKey)
                            setHasOpenActivity(true)
                            setLoading(false)
                            return
                        }
                    }
                } catch {}
                localStorage.removeItem(`activity_${activityName}`)
            }

            if (session?.user?.id && status === "authenticated") {
                try {
                    const q = query(ref(db, 'activities'), orderByChild('activityUserID'), equalTo(session.user.id))
                    const snap = await get(q)
                    if (snap.exists()) {
                        let foundKey = ''
                        snap.forEach((child) => {
                            const data = child.val()
                            if (data.activityState === true && data.activityName?.toLowerCase().includes(activityName.replace(/-/g, ' '))) {
                                foundKey = child.key!
                            }
                        })
                        if (foundKey) {
                            localStorage.setItem(`activity_${activityName}`, foundKey)
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
