import ToolStarter from "@/app/components/components-ui/tool-starter"

export default function QuarentenaFracionada() {
    return (
        <div className="flex flex-col gap-4 w-full h-full p-4">
            <h1 className="text-xl sm:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">QUARENTENA FRACIONADA</h1>
            <div className="flex flex-col gap-4 w-full mt-4">
                <ToolStarter
                    activityName="quarentena-fracionada"
                    formHref="/pages/kit-ferramentas/quarentena-fracionada/form"
                />
            </div>
        </div>
    )
}
