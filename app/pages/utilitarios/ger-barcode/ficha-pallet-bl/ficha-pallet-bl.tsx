'use client'

import { useState } from 'react';
import FileUploader from '@/app/components/components-ui/ficha-pallet/FileUploader';
import TargetBarcodePrint from '@/app/components/components-ui/ficha-pallet/TargetBarcodePrint';


export default function FichaPalletBl() {
  const [data, setData] = useState<any[]>([]);

  return (
    <>
      <h1 className="font-bold mb-4 text-xl md:text-2xl">IMPRESSÃO DE CÓDIGO DE BARRAS</h1>
      <div className='flex flex-col gap-2'>
        <FileUploader onDataParsed={setData} />
        {data.length > 0 && <TargetBarcodePrint data={data} />}
      </div>
    </>
  );
}
