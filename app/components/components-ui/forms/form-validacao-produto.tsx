'use client'

import { useEffect } from "react"

import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { dateDb, fullDate, fullDatePrint } from "@/app/utils/ger-dates"
import { formValAddressProduct } from "@/app/schemas/validar-endereco-produto"

import { push, ref, update } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"

import { DadosDaAtividade } from "@/app/types/TasksProps"

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
      activityUserCenter: activity.activityUserCenter,
      activityID: activity.activityID,
      activityName: activity.activityName,
      activityInitDate: activity.activityInitDate
    }

    finishActivity(atividadeData)

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
        activityDate: dateDb()
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
