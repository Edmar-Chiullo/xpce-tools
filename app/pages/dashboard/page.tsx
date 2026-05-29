import ContainerDash from "@/app/components/components-ui/dash-container";

export default function Home() {

    return (
        <section className="flex items-center w-full h-full gap-1 p-2 ">
            <div className="flex flex-col justify-between text-center w-full h-[97vh] bg-zinc-100">
               <ContainerDash />
            </div>
        </section> 
    );
}   