import { z } from "zod";

export const pessoaWriteSchema = z.object({
  nome: z.string().min(3),
  cpf: z.string().length(11),
  ativo: z.boolean(),
});

export type PessoaWriteDTO = z.infer<typeof pessoaWriteSchema>;