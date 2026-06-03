import EnderecoVazio from "@/app/components/components-ui/forms/form-aereovazio";

export default function appOperator() {
    return (
        <div className="relative flex flex-col gap-4 w-full h-full">
            <h1>App Aéreo Vazio</h1>
            <EnderecoVazio activity={{
                activityUserCenter: "PP01",
                activityID: "123456",
                activityName: "Aereo Vazio",
                activityInitDate: "2024-01-01T00:00:00Z"
            }} />
        </div>
    )
}