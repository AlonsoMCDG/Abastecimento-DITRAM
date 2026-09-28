import { z } from "zod";

export const secretariaFormSchema = z.object({
  sigla: z.string().min(2, "A sigla deve ter pelo menos 2 caracteres.").max(10, "A sigla não pode exceder 10 caracteres."),
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  ativo: z.boolean().default(true),
});

export type SecretariaFormData = z.infer<typeof secretariaFormSchema>;