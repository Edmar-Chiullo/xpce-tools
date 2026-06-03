
'use client'

import { useEffect } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { SchemaValidarMaster } from "@/app/schemas/validar-master"
import { dateDb, fullDate, fullDatePrint } from "@/app/utils/ger-dates"

import { DadosDaAtividade } from "@/app/types/TasksProps"

import { push, ref, update } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"

export default function FormValidaMasterExpedicao({ atividade }: { atividade: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, formState: { errors } } = useForm<z.infer<typeof SchemaValidarMaster>>({
    resolver: zodResolver(SchemaValidarMaster),
    defaultValues: {
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
      validMaster: ""
    },
  })  

  useEffect(() => {
    const inputEnd:any = document.querySelector('.loadAddress')
    inputEnd.focus()
  }, [])

  async function pushTaskActivity(values:any) {
      const strDate = fullDate()
      .replace('/','')
      .replace('/','')
  
      const path = `${strDate.slice(4,8)}/${strDate.slice(2,8)}/${strDate.slice(0,2)}/${values.activityUserCenter}/pce/${values.activityName}/${values.activityID}/activity/activityTasks`;
      try {
          await push(ref(db, path, ), {
              activity: values
          });
          
          return {
              success: true,
              message: 'Dados salvo com sucesso.'
          }
      } catch(erro) {
          return {
              success: false,
              message: 'Falha gravar o endereço!'
          };
      }
  }
  
  async function finishActivity(activity:any) {
    const strDate = fullDatePrint(activity.activityInitDate)
    .replace('/','')
    .replace('/','')
  
    const path = `${strDate.slice(4,8)}/${strDate.slice(2,8)}/${strDate.slice(0,2)}/${activity.activityUserCenter}/pce/${activity.activityName}/${activity.activityID}/activity/activityFinisDate`;
    const pathState = `${strDate.slice(4,8)}/${strDate.slice(2,8)}/${strDate.slice(0,2)}/${activity.activityUserCenter}/pce/${activity.activityName}/${activity.activityID}/activity/activityState`;
    try {
        const date = dateDb()
        await update(ref(db), {
            [path]: date,
            [pathState]: false,
        });
    } catch(erro) {
        return {
            success: false,
            message: 'Falha ao finalizar a atividade'
        };
    }
  }

  function getActivity(act: DadosDaAtividade) {

    const atividadeData = {
      activityUserCenter: atividade.activityUserCenter,
      activityID: atividade.activityID,
      activityName: atividade.activityName,
      activityInitDate: atividade.activityInitDate
    }

    finishActivity(atividadeData)

    window.location.reload()
  }

  async function onSubmit(values: z.infer<typeof SchemaValidarMaster>) {

    reset({
      validMaster: '',
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
    })

      const data = {
        activityUserCenter: atividade.activityUserCenter,
        activityID: values.activityID,
        activityName: values.activityName,
        validMaster: values.validMaster,
        activityDate: dateDb()
    }
    
    const result = await pushTaskActivity(data)
    setFocus("validMaster")

  }
  
  return (
    <div className="absolute top-10 flex flex-col gap-2 w-full h-auto px-4">
      <h1 className="md:text-xl lg:text-2xl">Valide master</h1>
      <span className="self-end">{atividade.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full md:gap-4">
       <div>
        <label htmlFor="">Master</label>
        <input type="text" placeholder="Leia o master" {...register("validMaster", { required: true })} className="loadAddress w-full border rounded-sm p-2" />
        {errors.validMaster && <span className="text-red-500 text-sm">{errors.validMaster.message}</span>}
       </div>
       
        <input type="hidden" {...register("activityID", { required: true })} name="activityID" defaultValue={atividade?.activityID ?? ""} />
        <input type="hidden" {...register("activityName", { required: true })} name="activityName" defaultValue={atividade?.activityName ?? ""} />
       
        <button type="submit" className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
          Confirmar
        </button>
      </form>
      <button onClick={() => getActivity(atividade)} className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
        Finalizar
      </button>
    </div>
  )
}
