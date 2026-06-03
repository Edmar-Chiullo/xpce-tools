import FormValidarEnderecoProduto from "@/app/components/components-ui/forms/form-validacao-produto"

export default function ValidarEnderecoProduto() {
    function iniciarAtividade() {
        console.log("Atividade de validação do endereço do produto iniciada.")
    }

    return (

        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <FormValidarEnderecoProduto activity={{
                    activityUserCenter: '',
                    activityID: '',
                    activityUserID: '',
                    activityName: '',
                    activityInitDate: '',
                }}/>
            </div>
        </div>
    )
}
