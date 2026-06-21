'use client'

import { useEffect } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { DadosDaAtividade } from "@/app/types/TasksProps";
import { SchemaQuarentenaFracionada } from "@/app/schemas/quarentena-fracionada"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormQuarentenaFracionada({ atividade }: { atividade: DadosDaAtividade | any }) {
  const  { reset, register, handleSubmit, setFocus, formState: { errors } } = useForm<z.infer<typeof SchemaQuarentenaFracionada>>({
    resolver: zodResolver(SchemaQuarentenaFracionada),
    defaultValues: {
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
      loadProduct: "",
      loadQuant: "",
      loadValid: ""
    },
  })

  useEffect(() => {
    setFocus("loadProduct")
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

  async function onSubmit(values: z.infer<typeof SchemaQuarentenaFracionada>) {
    reset({
      loadProduct: '',
      loadQuant:  '',
      loadValid: '',
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
    })

    const data = {
      activityUserCenter: atividade.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      loadProduct: values.loadProduct,
      loadQuant: values.loadQuant,
      loadValid: values.loadValid,
      activityDate: Date.now()
    }

    const result = await pushTaskActivity(data)
    setFocus("loadProduct")
  }

  return (
    <div className="absolute top-10 flex flex-col gap-2 w-full h-auto px-4">
      <h1 className="md:text-xl lg:text-2xl">Quarentena Fracionada</h1>
      <span className="self-end">{atividade.activityID}</span>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full md:gap-4">
          <div>
            <label htmlFor="">Produto</label>
            <input type="text" placeholder="Leia o produto" {...register("loadProduct", { required: true })} className="loadProduct w-full border rounded-sm p-2"/>
            {errors.loadProduct && <span className="text-red-500 text-sm">{errors.loadProduct.message}</span>}
          </div>

          <div>
            <label htmlFor="">Quantidade</label>
            <input type="text" placeholder="Informe a quantidade" {...register("loadQuant", { required: true })} className="w-full border rounded-sm p-2" />
            {errors.loadQuant && <span className="text-red-500 text-sm">{errors.loadQuant.message}</span>}
          </div>

          <div>
            <label htmlFor="">Validade</label>
            <input type="text" placeholder="Informe a validade" {...register("loadValid", { required: true })} className="loadValid w-full border rounded-sm p-2" />
            {errors.loadValid && <span className="text-red-500 text-sm">{errors.loadValid.message}</span>}
          </div>

          <input type="hidden" {...register("activityID")} />
          <input type="hidden" {...register("activityName")} />

          <button type="submit" className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
            Confirmar
          </button>
        </form>
        <button onClick={() => getActivity(atividade)} className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
          Finalizar
        </button>
    </div>
  );
}
