import { z } from "zod";

export const tipoCombustivelWriteSchema = z.object({
  nome: z.string().min(2),
  ativo: z.boolean(),
  // Note que omitimos o 'slug' aqui, pois é um campo read_only no backend
});

export type TipoCombustivelWriteDTO = z.infer<typeof tipoCombustivelWriteSchema>;