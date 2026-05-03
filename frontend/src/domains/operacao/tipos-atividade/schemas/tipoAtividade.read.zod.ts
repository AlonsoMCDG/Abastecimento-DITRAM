import { z } from "zod";

export const tipoAtividadeReadSchema = z.object({
  id: z.number(),
  nome: z.string(),
  ativo: z.boolean(),
});

export type TipoAtividadeReadDTO = z.infer<typeof tipoAtividadeReadSchema>;