
'use client'

import { useEffect } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { SchemaValidarMaster } from "@/app/schemas/validar-master"
import { DadosDaAtividade } from "@/app/types/TasksProps"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

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
    setFocus("validMaster")
  }, [])

  async function pushTaskActivity(values: any) {
    try {
      const activityKey = await findOrCreateActivity({
        activityUserCenter: atividade.activityUserCenter,
        activityID: atividade.activityID,
        activityName: atividade.activityName,
        activtyUserName: atividade.activtyUserName,
        activityUserID: atividade.activityUserID,
        activityLocalWork: atividade.activityLocalWork,
      })

      await createTask(activityKey, 'valida-master-expedicao', values)

      return {
        success: true,
        message: 'Dados salvo com sucesso.'
      }
    } catch (erro) {
      return {
        success: false,
        message: 'Falha gravar o endereço!'
      };
    }
  }

  async function finishCurrentActivity(act: DadosDaAtividade) {
    try {
      await finishActivity({
        activityUserCenter: act.activityUserCenter || '',
        activityID: act.activityID || '',
        activityName: act.activityName || '',
      })
    } catch (erro) {
      return {
        success: false,
        message: 'Falha ao finalizar a atividade'
      };
    }
  }

  function getActivity(act: DadosDaAtividade) {
    finishCurrentActivity(act)
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
      activityDate: Date.now()
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
