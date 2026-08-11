import { z } from "zod";

export const instituicaoFormSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  tipo: z.string().default("OUTRO"),
  secretaria_id: z.number({ message: "Selecione uma secretaria vinculada." }).min(1, "Selecione uma secretaria vinculada."),
  ativo: z.boolean().default(true),
});

export type InstituicaoFormData = z.infer<typeof instituicaoFormSchema>;