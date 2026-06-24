'use client'

import { useEffect, useRef } from "react"

import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"

import { formValAddressProduct } from "@/app/schemas/validar-endereco-produto"
import { DadosDaAtividade } from "@/app/types/TasksProps"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormValidarEnderecoProduto({ activity }: { activity: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, setValue, formState: { errors } } = useForm<z.infer<typeof formValAddressProduct>>({
    resolver: zodResolver(formValAddressProduct),
    defaultValues: {
      activityID: activity?.activityID,
      activityName: activity?.activityName,
      loadAddress: "",
      loadProduct: "",
    },
  })

  const loadAddressRef = useRef<HTMLInputElement>(null)
  const loadProductRef = useRef<HTMLInputElement>(null)

  const addrReg = register("loadAddress", { required: true })
  const { ref: addrRHFRef, ...addrProps } = addrReg

  const prodReg = register("loadProduct", { required: true })
  const { ref: prodRHFRef, ...prodProps } = prodReg

  useEffect(() => {
    loadAddressRef.current?.focus()
  }, [])

  function onKeyDown(e: React.KeyboardEvent, nextRef?: React.RefObject<HTMLInputElement | null>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (nextRef?.current) {
        nextRef.current.focus()
      }
    }
  }

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

        localStorage.setItem('activity_validacao-produto-endereco', activityKey)
      }

      await createTask(activityKey, 'validacao-produto-endereco', values)

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
      localStorage.removeItem('activity_validacao-produto-endereco')
      sessionStorage.removeItem('active_activity_key_validacao-produto-endereco')
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

  async function onSubmit(values: z.infer<typeof formValAddressProduct>) {
    setValue("loadAddress", "")
    setValue("loadProduct", "")

    const data = {
      activityUserCenter: activity.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      loadAddress: values.loadAddress,
      loadProduct: values.loadProduct,
      activityDate: Date.now()
    }

    const result = await pushTaskActivity(data)
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    setTimeout(() => loadAddressRef.current?.focus(), 150)
  }

  return (
    <div className="flex flex-col gap-4 w-full px-2 sm:px-4 py-2">
      <h1 className="text-lg sm:text-xl lg:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">Produto x Endereço</h1>
      <span className="self-end text-sm text-zinc-600">{activity.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
       <div>
        <label className="text-sm text-zinc-700">Endereço</label>
        <input type="text" placeholder="Leia o endereço"
          {...addrProps}
          ref={(e) => { addrRHFRef(e); loadAddressRef.current = e }}
          onKeyDown={(e) => onKeyDown(e, loadProductRef)}
          className="loadAddress w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
        {errors.loadAddress && <span className="text-red-500 text-sm">{errors.loadAddress.message}</span>}
       </div>
       <div>
        <label className="text-sm text-zinc-700">Produto</label>
        <input type="text" placeholder="Leia o produto"
          {...prodProps}
          ref={(e) => { prodRHFRef(e); loadProductRef.current = e }}
          className="w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
        {errors.loadProduct && <span className="text-red-500 text-sm">{errors.loadProduct.message}</span>}
        </div>

        <input type="hidden" {...register("activityID", { required: true })} />
        <input type="hidden" {...register("activityName", { required: true })} />

        <button type="submit" className="w-full h-12 mt-4 bg-zinc-950 text-zinc-50 rounded-md text-base font-medium hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer">
          Confirmar
        </button>
      </form>

      <button onClick={() => getActivity(activity)} className="w-full h-12 bg-red-600 text-zinc-50 rounded-md text-base font-medium hover:bg-red-700 active:bg-red-800 cursor-pointer">
        Finalizar Atividade
      </button>
    </div>
  );
}
