import { z } from "zod";

export const secretariaWriteSchema = z.object({
  nome: z.string().min(3),
  sigla: z.string().min(2).max(10),
  ativo: z.boolean(),
});

export type SecretariaWriteDTO = z.infer<typeof secretariaWriteSchema>;