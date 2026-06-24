import ContainerTasks from "@/app/components/components-ui/task-container";

export default function Home() {
    return (
        <section className="flex w-full h-full p-2">
            <div className="flex flex-col w-full h-full bg-zinc-100 rounded-2xl">
               <ContainerTasks />
            </div>
        </section>
    );
}   