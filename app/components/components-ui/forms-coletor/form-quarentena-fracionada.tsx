'use client'

import { useEffect, useRef } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "react-toastify"

import { DadosDaAtividade } from "@/app/types/TasksProps";
import { SchemaQuarentenaFracionada } from "@/app/schemas/quarentena-fracionada"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormQuarentenaFracionada({ atividade, originHref }: { atividade: DadosDaAtividade | any, originHref?: string }) {
  const  { reset, register, handleSubmit, setFocus, setValue, formState: { errors } } = useForm<z.infer<typeof SchemaQuarentenaFracionada>>({
    resolver: zodResolver(SchemaQuarentenaFracionada),
    defaultValues: {
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
      loadProduct: "",
      loadQuant: "",
      loadValid: ""
    },
  })

  const loadProductRef = useRef<HTMLInputElement>(null)
  const loadQuantRef = useRef<HTMLInputElement>(null)
  const loadValidRef = useRef<HTMLInputElement>(null)

  const prodReg = register("loadProduct", { required: true })
  const { ref: prodRHFRef, ...prodProps } = prodReg

  const quantReg = register("loadQuant", { required: true })
  const { ref: quantRHFRef, ...quantProps } = quantReg

  const validReg = register("loadValid", { required: true })
  const { ref: validRHFRef, ...validProps } = validReg

  useEffect(() => {
    loadProductRef.current?.focus()
  }, [])

  useEffect(() => {
    if (atividade?.activityID) {
      setValue("activityID", atividade.activityID)
      setValue("activityName", atividade.activityName)
    }
  }, [atividade?.activityID, atividade?.activityName])

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

      }

      await createTask(activityKey, 'quarentena-fracionada', values)

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
      sessionStorage.removeItem('active_activity_key_quarentena-fracionada')
      toast.success('Atividade finalizada com sucesso!')
    } catch (erro) {
      toast.error('Falha ao finalizar a atividade')
    }
  }

  async function getActivity(act: DadosDaAtividade) {
    await finishCurrentActivity(act)
    window.location.href = originHref || '/pages/kit-ferramentas'
  }

  async function onSubmit(values: z.infer<typeof SchemaQuarentenaFracionada>) {
    setValue("loadProduct", "")
    setValue("loadQuant", "")
    setValue("loadValid", "")

    const data = {
      activityUserCenter: atividade.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      loadProduct: values.loadProduct,
      loadQuant: values.loadQuant,
      loadValid: values.loadValid,
      activityDate: new Date().toISOString().split('T')[0]
    }

    const result = await pushTaskActivity(data)
    if (!result.success) {
      toast.error(result.message)
    }
    setTimeout(() => loadProductRef.current?.focus(), 150)
  }

  return (
    <div className="flex flex-col gap-4 w-full px-2 sm:px-4 py-2">
      <h1 className="text-lg sm:text-xl lg:text-2xl text-zinc-950 font-bold ml-12 lg:ml-0">Quarentena Fracionada</h1>
      <span className="self-end text-sm text-zinc-600">{atividade.activityID}</span>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full">
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
