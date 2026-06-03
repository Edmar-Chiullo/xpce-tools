'use client'

import z from "zod"
import { Form, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { push, ref, update } from "firebase/database"
import { db } from "@/app/firebasekey/keyapi"

import { dateDb, fullDate, fullDatePrint } from "@/app/utils/ger-dates"
import { DadosDaAtividade } from "@/app/types/TasksProps";

import { SchemaQuarentenaFracionada } from "@/app/schemas/quarentena-fracionada"

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
      activityUserCenter: atividade.activityUserCenter,
      activityID: atividade.activityID,
      activityName: atividade.activityName,
      activityInitDate: atividade.activityInitDate
    }

    finishActivity(atividadeData)
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
        activityDate: dateDb()
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
         
          <input type="hidden" name="activityID"  />
          <input type="hidden" name="activityName" />
         
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
