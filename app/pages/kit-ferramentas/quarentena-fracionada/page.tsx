import Link from "next/link"

export default function QuarentenaFracionada() {
    function iniciarAtividade() {
        console.log("Atividade de quarentena fracionada iniciada.")
    }

    return (

        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <h1 className="text-zinc-950"><strong>QUARENTENA FRACIONADA</strong></h1>
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <h3>Iniciar atividade?</h3>
                <Link href="/pages/kit-ferramentas/quarentena-fracionada/form" className="w-full">
                    <div className="flex justify-center items-center w-full text-2xl text-center bg-zinc-950 text-zinc-50 h-10 rounded-md">
                        Iniciar
                    </div>
                </Link>            
            </div>
        </div>
    )
}
