
export default function AereoVazio() {
    function iniciarAtividade() {
        console.log("Atividade de aéreo vazio iniciada.")
    }

    return (
        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <h1 className="text-zinc-950"><strong>AÉREO VAZIO</strong></h1>
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <h3>Iniciar atividade?</h3>
                <button className="w-full text-lg font-light bg-zinc-950 text-zinc-50 h-10 rounded-md">
                    Iniciar
                </button>
            </div>
        </div>
    )
}