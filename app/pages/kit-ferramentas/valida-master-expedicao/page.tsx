import ToolStarter from "@/app/components/components-ui/tool-starter"

export default function ValidaMasterExpedicao() {
    return (
        <div className="flex flex-col gap-4 w-full h-full p-4">
            <h1 className="text-xl sm:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">VALIDAÇÃO MASTER DE EXPEDIÇÃO</h1>
            <div className="flex flex-col gap-4 w-full mt-4">
                <ToolStarter
                    activityName="valida-master-expedicao"
                    formHref="/pages/kit-ferramentas/valida-master-expedicao/form"
                />
            </div>
        </div>
    )
}
