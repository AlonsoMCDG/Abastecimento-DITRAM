import { z } from "zod";

export const rotaWriteSchema = z.object({
  nome: z.string(),
  secretaria: z.number(),
  distancia_km: z.number().nullable(),
  detalhes: z.string().nullable().optional(),
  ativa: z.boolean(),
});

export type RotaWriteDTO = z.infer<typeof rotaWriteSchema>;