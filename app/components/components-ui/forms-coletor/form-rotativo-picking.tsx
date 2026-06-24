'use client'

import { useEffect, useRef } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"

import { DadosDaAtividade } from "@/app/types/TasksProps";
import { SchemaRotativoPicking } from "@/app/schemas/rotativo-picking"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormRotativoPicking({ atividade }: { atividade: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, setValue, formState: { errors } } = useForm<z.infer<typeof SchemaRotativoPicking>>({
    resolver: zodResolver(SchemaRotativoPicking),
    defaultValues: {
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
      loadAddress: "",
      loadProduct: "",
      loadQuant: "",
      loadValid: ""
    },
  })

  const loadAddressRef = useRef<HTMLInputElement>(null)
  const loadProductRef = useRef<HTMLInputElement>(null)
  const loadQuantRef = useRef<HTMLInputElement>(null)
  const loadValidRef = useRef<HTMLInputElement>(null)

  const addrReg = register("loadAddress", { required: true })
  const { ref: addrRHFRef, ...addrProps } = addrReg

  const prodReg = register("loadProduct", { required: true })
  const { ref: prodRHFRef, ...prodProps } = prodReg

  const quantReg = register("loadQuant", { required: true })
  const { ref: quantRHFRef, ...quantProps } = quantReg

  const validReg = register("loadValid", { required: true })
  const { ref: validRHFRef, ...validProps } = validReg

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

        localStorage.setItem('activity_rotativo-picking', activityKey)
      }

      await createTask(activityKey, 'rotativo-picking', values)

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
      localStorage.removeItem('activity_rotativo-picking')
      sessionStorage.removeItem('active_activity_key_rotativo-picking')
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

  async function onSubmit(values: z.infer<typeof SchemaRotativoPicking>) {
    setValue("loadAddress", "")
    setValue("loadProduct", "")
    setValue("loadQuant", "")
    setValue("loadValid", "")

    const data = {
      activityUserCenter: atividade.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      loadAddress: values.loadAddress,
      loadProduct: values.loadProduct,
      loadQuant: values.loadQuant,
      loadValid: values.loadValid,
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
      <h1 className="text-lg sm:text-xl lg:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">Rotativo De Picking</h1>
      <span className="self-end text-sm text-zinc-600">{atividade.activityID}</span>
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
            onKeyDown={(e) => onKeyDown(e, loadQuantRef)}
            className="loadProduct w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
          {errors.loadProduct && <span className="text-red-500 text-sm">{errors.loadProduct.message}</span>}
       </div>
       <div>
          <label className="text-sm text-zinc-700">Quantidade</label>
          <input type="text" placeholder="Informe a quantidade"
            {...quantProps}
            ref={(e) => { quantRHFRef(e); loadQuantRef.current = e }}
            onKeyDown={(e) => onKeyDown(e, loadValidRef)}
            className="w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
          {errors.loadQuant && <span className="text-red-500 text-sm">{errors.loadQuant.message}</span>}
       </div>

        <div>
          <label className="text-sm text-zinc-700">Validade</label>
          <input type="text" placeholder="Informe a validade"
            {...validProps}
            ref={(e) => { validRHFRef(e); loadValidRef.current = e }}
            className="loadValid w-full border rounded-md p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950" autoComplete="off"/>
          {errors.loadValid && <span className="text-red-500 text-sm">{errors.loadValid.message}</span>}
        </div>

        <input type="hidden" {...register("activityID")} />
        <input type="hidden" {...register("activityName")} />

        <button type="submit" className="w-full h-12 bg-zinc-950 text-zinc-50 rounded-md text-base font-medium hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer">
          Confirmar
        </button>
      </form>

      <button onClick={() => getActivity(atividade)} className="w-full h-12 bg-red-600 text-zinc-50 rounded-md text-base font-medium hover:bg-red-700 active:bg-red-800 cursor-pointer">
        Finalizar Atividade
      </button>
    </div>
  );
}
