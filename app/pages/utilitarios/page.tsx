'use client'

import { useRouter } from "next/navigation"

export default function Utils() {
  const router = useRouter()

  return (
    <div className="relative flex flex-col gap-4 w-full text-zinc-400">
      <h1 className="text-zinc-950"><strong>UTILITÁRIOS</strong></h1>

      <div className="flex flex-col gap-2 w-full mt-6">
        <div className="flex flex-col gap-4 w-full text-zinc-400 border border-zinc-500 rounded-2xl p-4">
          <ul className="flex flex-col gap-2 w-full mt-6 text-zinc-50 text-center">
            <li
              onClick={() => router.push("/pages/utilitarios/ger-barcode/ficha-pallet")}
              className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md"
            >
              Ficha Pallet Padrão
            </li>
            <li
              onClick={() => router.push("/pages/utilitarios/ger-barcode/ficha-pallet-bl")}
              className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md"
            >
              Ficha Pallet BL
            </li>
            <li
              onClick={() => router.push("/pages/utilitarios/ger-barcode/ficha-pallet-dunean")}
              className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 p-2 rounded-md"
            >
              Ficha Pallet Dunean
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
