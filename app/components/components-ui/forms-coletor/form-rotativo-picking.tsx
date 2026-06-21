
'use client'

import { useEffect } from "react"

import z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { DadosDaAtividade } from "@/app/types/TasksProps";
import { SchemaRotativoPicking } from "@/app/schemas/rotativo-picking"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormRotativoPicking({ atividade }: { atividade: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, formState: { errors } } = useForm<z.infer<typeof SchemaRotativoPicking>>({
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

  useEffect(() => {
    setFocus("loadAddress")
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
    reset({
      loadAddress: '',
      loadProduct: '',
      loadQuant: '',
      loadValid: '',
      activityID: atividade?.activityID,
      activityName: atividade?.activityName,
    })

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
    setFocus("loadAddress")
  }

  return (

    <div className="absolute top-10 flex flex-col gap-1 w-full h-auto px-4">
      <h1 className="md:text-xl lg:text-2xl">Rotativo De Picking</h1>
      <span className="self-end">{atividade.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 w-full md:gap-3">
        <div>
          <label htmlFor="">Endereço</label>
          <input type="text" placeholder="Leia o endereço" {...register("loadAddress", { required: true })} className="loadAddress w-full border rounded-sm p-2" />
          {errors.loadAddress && <span className="text-red-500 text-sm">{errors.loadAddress.message}</span>}
        </div>

       <div>
          <label htmlFor="">Produto</label>
          <input type="text" placeholder="Leia o produto" {...register("loadProduct", { required: true })} className="loadProduct w-full border rounded-sm p-2" />
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

        <input type="hidden" name="activityID" defaultValue={atividade?.activityID ?? ""} />
        <input type="hidden" name="activityName" defaultValue={atividade?.activityName ?? ""} />

        <button type="submit" className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
          Confirmar
        </button>
      </form>

      <button onClick={() => getActivity(atividade)} className="w-full h-10 bg-zinc-950 text-zinc-50 mt-2 rounded-sm">
        Finalizar
      </button>
    </div>
  );
}
