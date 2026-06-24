'use client'

import { useEffect, useRef } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"

import { SchemaValidarMaster } from "@/app/schemas/validar-master"
import { DadosDaAtividade } from "@/app/types/TasksProps"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormValidaMasterExpedicao({ atividade }: { atividade: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, setValue, formState: { errors } } = useForm<z.infer<typeof SchemaValidarMaster>>({
    resolver: zodResolver(SchemaValidarMaster),
    defaultValues: {
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
      validMaster: ""
    },
  })

  const validMasterRef = useRef<HTMLInputElement>(null)

  const masterReg = register("validMaster", { required: true })
  const { ref: masterRHFRef, ...masterProps } = masterReg

  useEffect(() => {
    validMasterRef.current?.focus()
  }, [])

  async function pushTaskActivity(values: any) {
    try {
      let activityKey = atividade._firebaseKey

      if (!activityKey) {
        activityKey = await findOrCreateActivity({
          activityUserCenter: atividade.activityUserCenter,
          activityID: atividade.activityID,
          activityName: atividade.activityName,
          activtyUserName: atividade.activtyUserName,
          activityUserID: atividade.activityUserID,
          activityLocalWork: atividade.activityLocalWork,
        })

        localStorage.setItem('activity_valida-master-expedicao', activityKey)
      }

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
      localStorage.removeItem('activity_valida-master-expedicao')
      sessionStorage.removeItem('active_activity_key_valida-master-expedicao')
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
    setValue("validMaster", "")

    const data = {
      activityUserCenter: atividade.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      validMaster: values.validMaster,
      activityDate: Date.now()
    }

    const result = await pushTaskActivity(data)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    setTimeout(() => validMasterRef.current?.focus(), 150)
  }

  return (
    <div className="flex flex-col gap-4 w-full px-2 sm:px-4 py-2">
      <h1 className="text-lg sm:text-xl lg:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">Validação Master</h1>
      <span className="self-end text-sm text-zinc-600">{atividade.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
       <div>
        <label className="text-sm text-zinc-700">Master</label>
        <input type="text" placeholder="Leia o master"
          {...masterProps}
          ref={(e) => { masterRHFRef(e); validMasterRef.current = e }}
          className="loadAddress w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
        {errors.validMaster && <span className="text-red-500 text-sm">{errors.validMaster.message}</span>}
       </div>

        <input type="hidden" {...register("activityID", { required: true })} />
        <input type="hidden" {...register("activityName", { required: true })} />

        <button type="submit" className="w-full h-12 bg-zinc-950 text-zinc-50 rounded-md text-base font-medium hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer">
          Confirmar
        </button>
      </form>
      <button onClick={() => getActivity(atividade)} className="w-full h-12 bg-red-600 text-zinc-50 rounded-md text-base font-medium hover:bg-red-700 active:bg-red-800 cursor-pointer">
        Finalizar Atividade
      </button>
    </div>
  )
}
