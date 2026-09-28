import { z } from "zod";

export const instituicaoReadSchema = z.object({
  id: z.number(),
  nome: z.string(),
  tipo: z.string(),
  tipo_nome: z.string(),
  ativo: z.boolean(),
  secretaria_id: z.number(),
  secretaria_nome: z.string(),
  secretaria_sigla: z.string(),
});

export type InstituicaoReadDTO = z.infer<typeof instituicaoReadSchema>;