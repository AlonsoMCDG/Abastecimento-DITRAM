import { z } from "zod";

export const rotaReadSchema = z.object({
  id: z.number(),
  nome: z.string(),
  distancia_km: z.union([z.number(), z.string()]).nullable(),
  detalhes: z.string().nullable(),
  ativa: z.boolean(),
  secretaria_id: z.number(),
  secretaria_nome: z.string(),
  secretaria_sigla: z.string(),
});

export type RotaReadDTO = z.infer<typeof rotaReadSchema>;