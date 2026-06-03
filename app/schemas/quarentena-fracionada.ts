import z from "zod";

const chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "N", "O", "P", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "/", "(", ")", ".", ","]

export const SchemaQuarentenaFracionada = z.object({
  activityID: z.string(),
  activityName: z.string(),
  loadProduct: z.string()
  .min(1, {
    message: "Inserir código.",
  }).max(14, {
      message: "Inserir a código do produto.",
  })
  .refine((cod) => {
    if (cod.length > 14) return false
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

