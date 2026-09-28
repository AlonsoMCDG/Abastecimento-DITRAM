import { z } from "zod";

export const tipoAtividadeFormSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  ativo: z.boolean().default(true),
});

export type TipoAtividadeFormData = z.infer<typeof tipoAtividadeFormSchema>;