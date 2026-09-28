import { z } from "zod";

export const tipoAtividadeWriteSchema = z.object({
  nome: z.string().min(2),
  ativo: z.boolean(),
});

export type TipoAtividadeWriteDTO = z.infer<typeof tipoAtividadeWriteSchema>;