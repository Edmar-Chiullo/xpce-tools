import Link from "next/link"

export default function rotativoPicking() {
    function iniciarAtividade() {
        console.log("Atividade de rotativo de picking iniciada.")
    }

    return (
        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <h1 className="text-zinc-950"><strong>ROTATIVO DE PICKING</strong></h1>
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <h3>Iniciar atividade?</h3>
                <Link href="/pages/kit-ferramentas/rotativo-picking/form" className="w-full">
                    <div className="w-full text-lg font-semibold text-center bg-zinc-950 text-zinc-50 h-10 rounded-md">
                        Iniciar
                    </div>
                </Link>  
            </div>
        </div>
    )
}
