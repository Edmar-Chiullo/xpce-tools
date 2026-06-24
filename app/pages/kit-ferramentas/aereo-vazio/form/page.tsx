'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ref, get, child } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"
import { generateActivityId } from "@/app/utils/ger-ids"
import EnderecoVazio from "@/app/components/components-ui/forms-coletor/form-aereovazio"

export default function AereoVazioForm() {
    const { data: session, status } = useSession()
    const [activityData, setActivityData] = useState<any>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        async function load() {
            const storedKey = sessionStorage.getItem('active_activity_key_aereo-vazio')
            if (storedKey) {
                try {
                    const snap = await get(child(ref(db), `activities/${storedKey}`))
                    if (snap.exists()) {
                        const data = snap.val()
                        setActivityData({ ...data, _firebaseKey: storedKey })
                        setReady(true)
                        return
                    }
                } catch {}
            }
            setActivityData({
                activityUserCenter: session?.user?.center || '',
                activityUserID: session?.user?.id || '',
                activtyUserName: session?.user?.name || '',
                activityName: 'Aereo Vazio',
                activityID: generateActivityId('Aéreo Vazio'),
            })
            setReady(true)
        }
        load()
    }, [session])

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500">Carregando sessão...</p>
            </div>
        )
    }

    if (!ready) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-zinc-500">Preparando...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full">
            <EnderecoVazio activity={activityData} />
        </div>
    )
}