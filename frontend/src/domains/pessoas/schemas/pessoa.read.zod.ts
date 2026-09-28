import { z } from "zod";

export const pessoaReadSchema = z.object({
  id: z.number(),
  nome: z.string(),
  cpf: z.string(),
  ativo: z.boolean(),
});

export type PessoaReadDTO = z.infer<typeof pessoaReadSchema>;