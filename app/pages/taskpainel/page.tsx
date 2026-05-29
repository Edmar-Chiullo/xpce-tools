import ContainerTasks from "@/app/components/components-ui/task-container";

export default function Home() {

    return (
        <section className="flex items-center w-full h-full gap-1 p-2 ">
            <div className="flex flex-col justify-between text-center w-full h-[97vh] bg-zinc-100">
               <ContainerTasks />
            </div>
        </section> 
    );
}   