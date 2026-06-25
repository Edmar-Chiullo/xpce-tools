'use client'

import { useEffect, useRef, type KeyboardEvent } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"

import { SchemaAereoVazio } from "@/app/schemas/aereovazio"
import { DadosDaAtividade } from "@/app/types/TasksProps"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function EnderecoVazio({ activity, originHref }: { activity: DadosDaAtividade | any, originHref?: string }) {

  const  { reset, register, handleSubmit, setFocus, setValue, formState: { errors } } = useForm<z.infer<typeof SchemaAereoVazio>>({
    resolver: zodResolver(SchemaAereoVazio),
    defaultValues: {
      activityID: activity?.activityID,
      activityName: activity?.activityName,
      loadAddress: ""
    },
  })

  const loadAddressRef = useRef<HTMLInputElement>(null)
  const loadAddressReg = register("loadAddress", { required: true })
  const { ref: loadAddressRHFRef, ...loadAddressProps } = loadAddressReg

  useEffect(() => {
    loadAddressRef.current?.focus()
  }, [])

  useEffect(() => {
    if (activity?.activityID) {
      setValue("activityID", activity.activityID)
      setValue("activityName", activity.activityName)
    }
  }, [activity?.activityID, activity?.activityName])

  async function pushTaskActivity(values: any) {
    try {
      let activityKey = activity._firebaseKey

      if (!activityKey) {
        activityKey = await findOrCreateActivity({
          activityUserCenter: activity.activityUserCenter,
          activityID: activity.activityID,
          activityName: activity.activityName,
          activtyUserName: activity.activtyUserName,
          activityUserID: activity.activityUserID,
          activityLocalWork: activity.activityLocalWork,
        })

      }

      await createTask(activityKey, 'aereo-vazio', values)

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
        activityUserID: act.activityUserID || '',
        _firebaseKey: act._firebaseKey,
      })
      sessionStorage.removeItem('active_activity_key_aereo-vazio')
      toast.success('Atividade finalizada com sucesso!')
    } catch (erro) {
      toast.error('Falha ao finalizar a atividade')
    }
  }

  async function getActivity(act: DadosDaAtividade) {
    await finishCurrentActivity(act)
    window.location.href = originHref || '/pages/kit-ferramentas'
  }

  async function onSubmit(values: z.infer<typeof SchemaAereoVazio>) {
    setValue("loadAddress", "")

    const data = {
      activityUserCenter: activity.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      loadAddress: values.loadAddress,
      activityDate: new Date().toISOString().split('T')[0]
    }

    const result = await pushTaskActivity(data)
    if (!result.success) {
      toast.error(result.message)
    }
    setTimeout(() => loadAddressRef.current?.focus(), 150)
  }

  return (
    <div className="flex flex-col gap-4 w-full px-2 sm:px-4 py-2">
      <h1 className="text-lg sm:text-xl lg:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">Rotativo de aéreo</h1>
      <span className="self-end text-sm text-zinc-600">{activity.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
       <div>
        <label className="text-sm text-zinc-700">Endereço</label>
        <input type="text" placeholder="Leia o endereço"
          {...loadAddressProps}
          ref={(e) => { loadAddressRHFRef(e); loadAddressRef.current = e }}
          className="loadAddress w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
        {errors.loadAddress && <span className="text-red-500 text-sm">{errors.loadAddress.message}</span>}
       </div>

        <input type="hidden" {...register("activityID")} />
        <input type="hidden" {...register("activityName")} />

        <button type="submit" className="w-full h-12 bg-zinc-950 text-zinc-50 rounded-md text-base font-medium hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer">
          Confirmar
        </button>
      </form>
      <button onClick={() => getActivity(activity)} className="w-full h-12 bg-red-600 text-zinc-50 rounded-md text-base font-medium hover:bg-red-700 active:bg-red-800 cursor-pointer">
        Finalizar Atividade
      </button>
    </div>
  )
}
