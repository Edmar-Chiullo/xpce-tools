'use client'

import JsBarcode from 'jsbarcode'
import { useEffect, useRef, useMemo } from 'react'
import { useReactToPrint } from 'react-to-print'

interface BarcodeData {
  Endereco: string
  Descricao: string
  Codigo: string
}

interface GroupedData {
  Endereco: string
  items: BarcodeData[]
}

const groupDataByEndereco = (data: BarcodeData[]): GroupedData[] => {
  const grupos: { [key: string]: GroupedData } = {}

  data.forEach((item) => {
    const { Endereco } = item
    if (!grupos[Endereco]) {
      grupos[Endereco] = {
        Endereco: Endereco,
        items: [],
      }
    }
    grupos[Endereco].items.push(item)
  })

  return Object.values(grupos)
}

export default function AdressPrintBarcode({ data }: { data: BarcodeData[] }) {
  const contentRef = useRef<HTMLDivElement>(null)

  const groupedData = useMemo(() => groupDataByEndereco(data), [data])

  const pairs = useMemo(() => {
    const result: GroupedData[][] = []
    for (let i = 0; i < groupedData.length; i += 2) {
      result.push(groupedData.slice(i, i + 2))
    }
    return result
  }, [groupedData])

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: 'Identificação prod. end.',
    onAfterPrint: () => console.log('Impressão concluída'),
  })

  useEffect(() => {
    groupedData.forEach((grupo, grupoIndex) => {
      grupo.items.forEach((item, itemIndex) => {
        const barcodeElement = document.getElementById(
          `barcode-grupo-${grupoIndex}-item-${itemIndex}`,
        )

        if (barcodeElement && item.Codigo) {
          JsBarcode(barcodeElement, item.Codigo.trim(), {
            format: 'CODE128',
            displayValue: true,
            height: 80,
            width: 4,
          })
        }
      })
    })
  }, [groupedData])

  return (
    <>
      <button 
        onClick={handlePrint} 
        className="no-print bg-zinc-950 text-white p-2 rounded-md hover:scale-[1.01] cursor-pointer"
      >
        Imprimir
      </button>

      <div ref={contentRef}>
          <div className="p-4 md:p-[30px] overflow-x-hidden">
            {pairs.map((pair, pairIndex) => (
              <div key={pairIndex} className="page-break">
                <div className="grid grid-cols-2 gap-4">
                  {pair.map((grupo, grupoIndex) => {
                    const actualIndex = pairIndex * 2 + grupoIndex
                    return (
                      <div key={actualIndex} className="border border-zinc-300 rounded-md p-3 break-inside-avoid">
                        <div style={{ padding: '8px 0', borderBottom: '2px solid #ccc', marginBottom: '8px' }}>
                          <h1 className='text-base md:text-lg font-bold'>
                            Endereço: {grupo.Endereco.trim()}
                          </h1>
                        </div>

                        {grupo.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex flex-col items-center gap-1 mb-3">
                            <div style={{ flexGrow: 1 }}>
                              <h1 className='text-sm md:text-xl'>{item.Descricao.trim()}</h1>
                            </div>
                            
                            <div className="flex items-center w-full max-w-full">
                              <svg 
                                id={`barcode-grupo-${actualIndex}-item-${itemIndex}`} 
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                  {pair.length === 1 && <div />}
                </div>
              </div>
            ))}
          </div>
      </div>
    </>
  )
}
