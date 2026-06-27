'use client'

import JsBarcode from 'jsbarcode'
import { useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import Image from 'next/image'

interface BarcodeData {
  Filial: string
  Codigo: string
}

export default function TargetBarcodePrint({ data }: { data: BarcodeData[] }) {
  const contentRef = useRef<HTMLDivElement>(null)

   const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Etiquetas',
    onAfterPrint: () => console.log('Impressão concluída'),
  })

  useEffect(() => {
    data.forEach((item, i) => {
      const barcode2 = document.getElementById(`barcode-codigo-${i}`)      

       if (barcode2 && item.Codigo) {
        JsBarcode(barcode2, item.Codigo, {
          format: 'CODE128',
          displayValue: true,
          height: 60,
          width: 2,
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
            <div key={i} className="page-break flex flex-col items-start justify-end p-4 md:p-[30px]">
              <div className='flex justify-start w-full mb-4'>
                <Image
                  src={'/logo-muffato.png'}
                  width={200}
                  height={100}
                  alt="Logo"
                  className="w-32 md:w-48 h-auto"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-[4px] mt-[6px]">
                <div className='flex flex-col items-end w-full'>
                  <h3 className='mr-10'>Filial:</h3>
                  <h1 className='text-base md:text-[18px] self-start'>{item.Filial}</h1>
                </div>
                <div className='p-1'>
                  <svg id={`barcode-codigo-${i}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
