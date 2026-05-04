import { z } from "zod";

export const veiculoReadSchema = z.object({
  id: z.number(),
  modelo: z.string(),
  placa: z.string(),
  categoria: z.string(),
  categoria_nome: z.string(),
  ativo: z.boolean(),
  consumo_estimado_combustivel: z.union([z.number(), z.string()]).nullable(),
  consumo_estimado_oleo: z.union([z.number(), z.string()]).nullable(),
  unidade_consumo: z.string(),
  unidade_consumo_nome: z.string(),
  hodometro_atual: z.union([z.number(), z.string()]),
  capacidade_carga_kg: z.number().nullable(),
  capacidade_pessoas: z.number().nullable(),
  tipo_combustivel_id: z.number(),
  tipo_combustivel_nome: z.string(),
});

export type VeiculoReadDTO = z.infer<typeof veiculoReadSchema>;