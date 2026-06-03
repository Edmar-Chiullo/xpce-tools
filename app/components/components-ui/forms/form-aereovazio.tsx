'use client'

import z from "zod"
import { useForm } from "react-hook-form"

import { zodResolver } from "@hookform/resolvers/zod"

import { SchemaAereoVazio } from "@/app/schemas/aereovazio"
import { DadosDaAtividade } from "@/app/types/TasksProps" 

import { dateDb } from "@/app/utils/ger-dates"

export default function EnderecoVazio({ activity }: { activity: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, formState: { errors } } = useForm<z.infer<typeof SchemaAereoVazio>>({
    resolver: zodResolver(SchemaAereoVazio),
    defaultValues: {
      activityID: activity?.activityID,
      activityName: activity?.activityName,
      loadAddress: ""
    },
  })  

  function getActivity(act: DadosDaAtividade) {
    window.location.reload()
  }

  async function onSubmit(values: z.infer<typeof SchemaAereoVazio>) {

    reset({
      loadAddress: '',
      activityID: activity?.activityID,
      activityName: activity?.activityName,
    })

      const data = {
        activityUserCenter: activity.activityUserCenter,
        activityID: values.activityID,
        activityName: values.activityName,
        loadAddress: values.loadAddress,
        activityDate: dateDb()
    }
    
   // const result = await pushTaskActivity(data)
    setFocus("loadAddress")

  }
  
  return (
    <div className="absolute top-10 flex flex-col gap-2 w-full h-auto px-4 text-2xl text-zinc-400">
      <h1 className="md:text-xl lg:text-2xl">Rotativo de aéreo</h1>
      <span className="self-end">{activity.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full md:gap-4">
       <div>
        <label htmlFor="">Endereço</label>
        <input type="text" placeholder="Leia o endereço" {...register("loadAddress", { required: true })} className="loadAddress w-full border rounded-sm p-2" />
        {errors.loadAddress && <span className="text-red-500 text-sm">{errors.loadAddress.message}</span>}
       </div>
       
        <input type="hidden" {...register("activityID", { required: true })} name="activityID" defaultValue={activity?.activityID ?? ""} />
        <input type="hidden" {...register("activityName", { required: true })} name="activityName" defaultValue={activity?.activityName ?? ""} />
       
        <button type="submit" className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
          Confirmar
        </button>
      </form>
      <button onClick={() => getActivity(activity)} className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
        Finalizar
      </button>
    </div>
  )
}
