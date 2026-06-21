'use client'

import { useEffect } from "react"

import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { formValAddressProduct } from "@/app/schemas/validar-endereco-produto"
import { DadosDaAtividade } from "@/app/types/TasksProps"
import { findOrCreateActivity, finishActivity, createTask } from "@/app/services/activityService"

export default function FormValidarEnderecoProduto({ activity }: { activity: DadosDaAtividade | any }) {

  const  { reset, register, handleSubmit, setFocus, formState: { errors } } = useForm<z.infer<typeof formValAddressProduct>>({
    resolver: zodResolver(formValAddressProduct),
    defaultValues: {
      activityID: activity?.activityID,
      activityName: activity?.activityName,
      loadAddress: ""
    },
  })

  useEffect(() => {
    setFocus("loadAddress")
  }, [])

  async function pushTaskActivity(values: any) {
    try {
      const activityKey = await findOrCreateActivity({
        activityUserCenter: activity.activityUserCenter,
        activityID: activity.activityID,
        activityName: activity.activityName,
        activtyUserName: activity.activtyUserName,
        activityUserID: activity.activityUserID,
        activityLocalWork: activity.activityLocalWork,
      })

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
    reset({
      loadAddress: '',
      loadProduct: '',
      activityID: activity?.activityID,
      activityName: activity?.activityName,
    })

    const data = {
      activityUserCenter: activity.activityUserCenter,
      activityID: values.activityID,
      activityName: values.activityName,
      loadAddress: values.loadAddress,
      loadProduct: values.loadProduct,
      activityDate: Date.now()
    }

    const result = await pushTaskActivity(data)
    setFocus("loadAddress")
  }

  return (
    <div className="absolute top-10 flex gap-2 flex-col w-full h-auto px-4">
      <h1 className="md:text-xl lg:text-2xl">Produto x Endereço</h1>
      <span className="self-end">{activity.activityID}</span>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3 h-auto md:gap-4">
       <div>
        <label htmlFor="">Endereço</label>
        <input type="text" placeholder="Leia o endereço" {...register("loadAddress", { required: true })} className="loadAddress w-full border rounded-sm p-2" />
        {errors.loadAddress && <span className="text-red-500 text-sm">{errors.loadAddress.message}</span>}
       </div>
       <div>
        <label htmlFor="">Produto</label>
        <input type="text" placeholder="Leia o produto" {...register("loadProduct", { required: true })} className="w-full border rounded-sm p-2" />
        {errors.loadProduct && <span className="text-red-500 text-sm">{errors.loadProduct.message}</span>}
        </div>

        <input type="hidden" {...register("activityID", { required: true })} />
        <input type="hidden" {...register("activityName", { required: true })} />

        <button type="submit" className="w-full h-10 mt-8 bg-zinc-950 text-zinc-50 rounded-sm">
          Confirmar
        </button>
      </form>

      <button onClick={() => getActivity(activity)} className="w-full h-10 bg-zinc-950 text-zinc-50 rounded-sm">
        Finalizar
      </button>
    </div>
  );
}
