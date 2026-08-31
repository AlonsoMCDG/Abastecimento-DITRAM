import { z } from "zod";

const decimalNumber = z
  .union([z.number(), z.string()])
  .transform((value) =>
    typeof value === "string" ? Number(value) : value
  );

// ============================================================
// DTO DE LEITURA
// O que vem da API para o frontend.
// Mantém os IDs explícitos porque são convenientes para a UI.
// ============================================================

export const veiculoReadSchema = z.object({
  id: z.number(),

  modelo: z.string(),
  placa: z.string(),

  categoria: z.string(),
  categoria_nome: z.string(),

  hodometro_atual: decimalNumber,

  unidade_consumo: z.string(),
  unidade_consumo_nome: z.string(),

  consumo_estimado_combustivel: z
    .union([z.number(), z.string()])
    .nullable(),

  consumo_estimado_oleo: z
    .union([z.number(), z.string()])
    .nullable(),

  capacidade_carga_kg: z.number().nullable(),
  capacidade_pessoas: z.number().nullable(),

  ativo: z.boolean(),

  tipo_combustivel_id: z.number(),
  tipo_combustivel_nome: z.string(),
});

export type VeiculoReadDTO = z.infer<typeof veiculoReadSchema>;

// ============================================================
// DTO DE ESCRITA
// O que o frontend envia para a API.
//
// IMPORTANTE:
// Os nomes devem corresponder aos campos aceitos pelo
// VeiculoWriteSerializer do backend.
// ============================================================

export const veiculoWriteSchema = z.object({
  modelo: z.string().min(1),

  placa: z.string().min(1),

  categoria: z.string().min(1),

  hodometro_atual: z.number(),

  unidade_consumo: z.string().min(1),

  consumo_estimado_combustivel: z
    .number()
    .nullable(),

  consumo_estimado_oleo: z
    .number()
    .nullable(),

  capacidade_carga_kg: z
    .number()
    .nullable(),

  capacidade_pessoas: z
    .number()
    .nullable(),

  ativo: z.boolean(),

  tipo_combustivel_id: z.number(),
});

export type VeiculoWriteDTO = z.infer<typeof veiculoWriteSchema>;

// ============================================================
// FILTROS DA LISTAGEM
// Estes nomes correspondem aos parâmetros de filtro da API.
// ============================================================

export const veiculoListParamsSchema = z.object({
  id: z.number().optional(),

  categoria: z.string().optional(),

  tipo_combustivel: z.number().optional(),

  ativo: z.union([
    z.boolean(),
    z.string()
  ]).optional(),

  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type VeiculoListParams = z.infer<typeof veiculoListParamsSchema>;