'use client'

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ref, get, child } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"
import { generateActivityId } from "@/app/utils/ger-ids"
import FormValidarEnderecoProduto from "@/app/components/components-ui/forms-coletor/form-validacao-produto"

export default function ValidarEnderecoProdutoForm() {
    const { data: session, status } = useSession()
    const [activityData, setActivityData] = useState<any>(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        async function load() {
            const storedKey = sessionStorage.getItem('active_activity_key_validacao-produto-endereco')
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
                activityName: 'Validação de Produto e Endereço',
                activityID: generateActivityId('Validação de Produto e Endereço'),
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
            <FormValidarEnderecoProduto activity={activityData} originHref="/pages/kit-ferramentas/validacao-produto-endereco" />
        </div>
    )
}
