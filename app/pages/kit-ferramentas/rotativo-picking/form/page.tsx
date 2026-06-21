import FormRotativoPicking from "@/app/components/components-ui/forms-coletor/form-rotativo-picking";

export default function RotativoPicking() {
    
    return (
        <div className="relative flex flex-col gap-4 w-full h-full text-zinc-400">  
            <div className="flex flex-col gap-2 w-full h-full mt-6">
                <FormRotativoPicking atividade={{
                    activityUserCenter: '',
                    activityID: '',
                    activityUserID: '',
                    activityName: '',
                }}/>
            </div>
        </div>
    )
}