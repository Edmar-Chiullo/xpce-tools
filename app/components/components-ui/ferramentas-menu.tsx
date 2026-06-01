'use client'

import { useRouter } from "next/navigation"

export default function ColectorMenu() {
    const router = useRouter()

    return (
        <div className="flex flex-col gap-4 w-full h-[97%] text-zinc-400 border border-zinc-500 p-4">
            <ul className="flex flex-col gap-2 w-full mt-6 text-zinc-50 text-center">
                <li onClick={() => router.push("/pages/kit-ferramentas/rotativo-picking")} className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md">Rotativo de picking</li>
                <li onClick={() => router.push("/pages/kit-ferramentas/aereo-vazio")} className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md">Aéreo vazio</li>
                <li onClick={() => router.push("/pages/kit-ferramentas/quarentena-fracionada")} className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md">Quarentena fracionada</li>
                <li onClick={() => router.push("/pages/kit-ferramentas/validacao-produto-endereco")} className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md">Validação de produto e endereço</li>
                <li onClick={() => router.push("/pages/kit-ferramentas/valida-master-expedicao")} className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md">Validação master de expedição</li>
            </ul>
        </div>
    )
}
