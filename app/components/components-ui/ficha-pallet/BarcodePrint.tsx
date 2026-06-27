'use client'

import { dateFichaPallet } from '@/app/utils/ger-dates'
import JsBarcode from 'jsbarcode'
import { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'

import Image from 'next/image'

interface BarcodeData {
  Codigo: string
  Validade: string
  Descricao: string
  Endereco: string
}

export default function BarcodePrint({ data }: { data: BarcodeData[] }) {
  const contentRef = useRef<HTMLDivElement>(null)

   const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Etiquetas',
    pageStyle: '@page { size: A4 landscape; margin: 10mm; }',
    onAfterPrint: () => console.log('Impressão concluída'),
  })




  useEffect(() => {
    data.forEach((item, i) => {
      const barcode1 = document.getElementById(`barcode-codigo-${i}`)
      const barcode2 = document.getElementById(`barcode-validade-${i}`)
      
      if (barcode1 && item.Codigo) {
        JsBarcode(barcode1, item.Codigo, {
          format: 'CODE128',
          displayValue: true,
          height: 80,
          width: 4,
        })
      }

      if (barcode2 && item.Validade) {
        JsBarcode(barcode2, dateFichaPallet(item.Validade), {
          format: 'CODE128',
          displayValue: true,
          height: 80,
          width: 3,
        })
      }
    })
  }, [data])

  return (
    <>
      <button onClick={handlePrint} className="no-print bg-zinc-950 text-white p-2 rounded-md hover:scale-[1.01] cursor-pointer">Imprimir</button>

      <div ref={contentRef}>
        <div className="overflow-x-hidden overflow-y-auto">
          {data.map((item, i) => (
            <div key={i} className="page-break flex flex-col items-center justify-end gap-5 md:gap-[20px] p-4 md:p-[20px]">
              <div className='flex justify-start w-full'>
                <Image
                  src={'/logo-muffato.png'}
                  width={200}
                  height={100}
                  alt="Logo"
                  className="w-32 md:w-48 h-auto"
                />
              </div>
              <div className='flex flex-col items-end w-full'>
                <h3 className='mr-10 md:mr-20'>Endereço:</h3>
                <h1 className='text-xl md:text-3xl'>{item.Endereco}</h1>
              </div>
              <div className='flex flex-col items-start w-full p-2 border border-zinc-950 rounded-md'>
                <h3>Descrição:</h3>
                <h3 className='text-xl md:text-4xl'>{item.Descricao}</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4 md:gap-[50px] mt-5 md:mt-[20px]">
                <div className='border border-zinc-950 rounded-md p-1'>
                  <p className="text-center text-xl md:text-[28px]">Produto</p>
                  <svg id={`barcode-codigo-${i}`} />
                </div>

                <div className='border border-zinc-950 rounded-md'>
                  <p className="text-center text-xl md:text-[28px]">Validade</p>
                  <svg id={`barcode-validade-${i}`} />
                </div>
              </div>
              <div className='flex justify-center w-full border border-zinc-950 rounded-md p-1 mt-4'>
                <span className='text-4xl md:text-6xl text-center'>{dateFichaPallet(item.Validade)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
