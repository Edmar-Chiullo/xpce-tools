import { z } from "zod"

const validMaster = ["PL", "WISPL"]

export const SchemaValidarMaster = z.object({
  activityID: z.string(),
  activityName: z.string(),
  validMaster: z.string()
  .min(1, {
    message: "Lei o master.",
  }).max(20, {
      message: "Código inválido.",
  })
  .refine((val) => {
    const sector = val.slice(0, 5)
    return (
      validMaster.includes(sector)
    )
  }, "Valor inválido (ex: WISPL2456789)"),  
})