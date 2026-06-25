'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ref, get, child } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"
import { generateActivityId } from "@/app/utils/ger-ids"
import FormQuarentenaFracionada from "@/app/components/components-ui/forms-coletor/form-quarentena-fracionada"

export default function QuarentenaFracionada() {
    const { data: session, status } = useSession()
    const [activityData, setActivityData] = useState<any>({
        activityUserCenter: session?.user?.center || '',
        activityUserID: session?.user?.id || '',
        activtyUserName: session?.user?.name || '',
        activityName: 'Quarentena Fracionada',
        activityID: generateActivityId('Quarentena Fracionada'),
    })
    const [ready, setReady] = useState(false)

    useEffect(() => {
        async function load() {
            const storedKey = sessionStorage.getItem('active_activity_key_quarentena-fracionada')
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
                activityUserID: session?.user?.registrationNumber || '',
                activtyUserName: session?.user?.name || '',
                activityName: 'Quarentena Fracionada',
                activityID: generateActivityId('Quarentena Fracionada'),
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
            <FormQuarentenaFracionada atividade={activityData} originHref="/pages/kit-ferramentas/quarentena-fracionada" />
        </div>
    )
}