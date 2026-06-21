import { Suspense } from "react";
import DashTipoContainer from "@/app/components/components-ui/dash-tipo-container";

export default function ValidacaoProdutoEndereco() {
  return (
    <section className="flex w-full h-full">
      <div className="flex flex-col w-full h-full bg-zinc-100">
        <Suspense fallback={null}>
          <DashTipoContainer filterKey="endereco" />
        </Suspense>
      </div>
    </section>
  );
}
