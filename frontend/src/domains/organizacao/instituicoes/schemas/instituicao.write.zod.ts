import { z } from "zod";

export const instituicaoWriteSchema = z.object({
  nome: z.string().min(3),
  tipo: z.string(),
  secretaria_id: z.number(),
  ativo: z.boolean(),
});

export type InstituicaoWriteDTO = z.infer<typeof instituicaoWriteSchema>;