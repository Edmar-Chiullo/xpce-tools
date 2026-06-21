import FormValidaMasterExpedicao from "@/app/components/components-ui/forms-coletor/form-valida-master-expedicao"


export default function ValidaMasterExpedicao() {
    function iniciarAtividade() {
        console.log("Atividade de validação do master de expedição iniciada.")
    }

    return (

        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <FormValidaMasterExpedicao atividade={{
                    activityUserCenter: '',
                    activityID: '',
                    activityUserID: '',
                    activityName: '',
                }}/> 
                
            </div>
        </div>
    )
}