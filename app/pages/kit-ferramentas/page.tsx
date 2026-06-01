import ColectorMenu from "@/app/components/components-ui/ferramentas-menu"

export default function Coletor() {

        return (
        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <h1 className="text-zinc-950"><strong>OPERAÇÕES PCE</strong></h1>

            <div className="flex flex-col gap-2 w-full h-[97%] mt-6">
                <ColectorMenu />
            </div>
        </div>
    )   
}