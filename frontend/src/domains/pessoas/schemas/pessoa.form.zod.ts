import { z } from "zod";

export const pessoaFormSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  cpf: z.string()
    .transform(val => val.replace(/\D/g, '')) // Remove tudo que não é número
    .pipe(z.string().length(11, "O CPF deve conter exatamente 11 números.")),
  ativo: z.boolean().default(true),
});

export type PessoaFormData = z.infer<typeof pessoaFormSchema>;