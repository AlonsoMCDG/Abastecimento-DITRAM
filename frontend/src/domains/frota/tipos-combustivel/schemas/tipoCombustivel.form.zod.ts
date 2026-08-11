import { z } from "zod";

export const tipoCombustivelFormSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  ativo: z.boolean().default(true),
});

export type TipoCombustivelFormData = z.infer<typeof tipoCombustivelFormSchema>;