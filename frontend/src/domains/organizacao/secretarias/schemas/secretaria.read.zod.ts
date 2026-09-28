import { z } from "zod";

export const secretariaReadSchema = z.object({
  id: z.number(),
  nome: z.string(),
  sigla: z.string(),
  ativo: z.boolean(),
});

export type SecretariaReadDTO = z.infer<typeof secretariaReadSchema>;