import z from "zod";

const validSectors = ["PP", "FR", "TP", "FB", "BL", "CF"]
const validSides = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "N", "O", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
const chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "N", "O", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "/", "(", ")", ".", ","]

export const SchemaRotativoPicking = z.object({
  activityID: z.string(),
  activityName: z.string(),
  loadAddress: z.string().refine((val) => {
    if (val.length !== 9) return false
    const sector = val.slice(0, 2)
    const street = Number(val.slice(2, 4))
    const block = Number(val.slice(4, 7))
    const floor = Number(val.slice(7, 8))
    const side = val.slice(8, 9)

    return (
      validSectors.includes(sector) &&
      street >= 0 && street <= 52 &&
      block >= 0 && block <= 260 &&
      floor >= 0 && floor <= 5 &&
      validSides.includes(side)
    )
  }, "Endereço inválido (ex: PP010010A)"),

  loadProduct: z.string()
  .min(1, {
    message: "Inserir a código do produto.",
  }).max(14, {
      message: "Código inválido.",
  })
  .refine((cod) => {
    return !cod.split('').some(char => chars.includes(char.toLocaleUpperCase()));
  }, "Código inválido"),

  loadQuant: z.string().min(2, {
    message: "Inserir a quantidade.",
  }),
  
   loadValid: z.string().min(8, {
    message: "Inserir a validade (ex: DDMMAAAA).",
  }).max(8, {
      message: "Data inválida (ex: DDMMAAAA).",
  }),
})