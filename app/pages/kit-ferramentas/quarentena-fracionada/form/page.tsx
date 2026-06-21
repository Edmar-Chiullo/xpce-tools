import FormQuarentenaFracionada from "@/app/components/components-ui/forms-coletor/form-quarentena-fracionada"

export default function QuarentenaFracionada() {
    function iniciarAtividade() {
        console.log("Atividade de quarentena fracionada iniciada.")
    }   

    return (

        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <FormQuarentenaFracionada atividade={{
                    activityUserCenter: '',
                    activityID: '',
                    activityUserID: '',
                    activityName: '',
                }}/> 
            </div>
        </div>
    )
}