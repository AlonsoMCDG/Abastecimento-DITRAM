import { z } from "zod";

export const tipoCombustivelReadSchema = z.object({
  id: z.number(),
  nome: z.string(),
  slug: z.string(), // O backend gera automaticamente
  ativo: z.boolean(),
});

export type TipoCombustivelReadDTO = z.infer<typeof tipoCombustivelReadSchema>;