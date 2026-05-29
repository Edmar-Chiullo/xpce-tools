import Link from "next/link";

export default function Home() {

  return (
    <section className="flex items-center w-full h-full gap-1 bg-gray-50 p-2 ">
      <div className="flex flex-col justify-between text-center w-full lg:w-70 h-[97vh] px-6 py-4 bg-zinc-100 rounded-2xl border-2 border-zinc-300">
          <h1 className="text-4xl font-bold p-2 text-zinc-500">PCE Tools</h1>
          <div className="lg:hidden flex flex-col gap-4 h-48 text-zinc-400">
            <h1 className="text-4xl font-bold">Bem-vindo às Ferramentas PCE</h1>
            <p className="text-lg">Sua solução completa para todas as tarefas relacionadas a PCE.</p>
          </div>
          <div className="h-[76vh] flex items-end">
            <Link href="/pages" className="w-full">
                <button className="h-10 w-full bg-zinc-950 text-white rounded hover:bg-zinc-900 hover:cursor-pointer">Entrar</button>
            </Link>
          </div>
      </div>
    </section>
  );
}
