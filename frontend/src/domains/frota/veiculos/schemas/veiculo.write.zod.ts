import { z } from "zod";

export const veiculoWriteSchema = z.object({
  modelo: z.string(),
  placa: z.string(),
  categoria: z.string(),
  ativo: z.boolean(),
  consumo_estimado_combustivel: z.number().nullable(),
  consumo_estimado_oleo: z.number().nullable(),
  unidade_consumo: z.string(),
  hodometro_atual: z.number(),
  capacidade_carga_kg: z.number().nullable(),
  capacidade_pessoas: z.number().nullable(),
  tipo_combustivel_id: z.number(),
});

export type VeiculoWriteDTO = z.infer<typeof veiculoWriteSchema>;