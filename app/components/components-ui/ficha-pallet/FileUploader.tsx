'use client'
import { ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface Props {
  onDataParsed: (data: any[]) => void;
}

export default function FileUploader({ onDataParsed }: Props) {
  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
   
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 0 });
      onDataParsed(data as any[]);
    };
    reader.readAsBinaryString(file);
  };

  return <input type="file" accept=".xlsx" onChange={handleFile} className='no-print bg-zinc-900 hover:bg-zinc-950 hover:scale-[1.01] rounded-md p-1 text-zinc-50 cursor-pointer' />;
}