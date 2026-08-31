import { z } from "zod";

// ============================================================
// DTO DE LEITURA
// O que vem da API para o frontend.
// Mantém os IDs explícitos porque são convenientes para a UI.
// ============================================================

export const guiaAbastecimentoReadSchema = z.object({
  id: z.number(),

  data_hora: z.string(),

  modalidade: z.string(),
  modalidade_nome: z.string(),

  pessoa_id: z.coerce.number(),
  pessoa_nome: z.string(),

  veiculo_id: z.coerce.number().nullable().optional(),
  veiculo_display: z.string(),
  tipo_veiculo: z.string().nullable().optional(),

  secretaria_id: z.coerce.number(),
  secretaria_nome: z.string(),
  secretaria_sigla: z.string(),

  instituicao_id: z.coerce.number().nullable().optional(),
  instituicao_nome: z.string().nullable().optional(),
  
  rota_id: z.coerce.number().nullable().optional(),
  rota_nome: z.string().nullable().optional(),
  rota_manual: z.string().nullable().optional(),

  tipo_atividade_id: z.coerce.number().nullable().optional(),
  tipo_atividade_nome: z.string(),
  
  tipo_combustivel_id: z.coerce.number(),
  tipo_combustivel_nome: z.string(),

  usuario_id: z.coerce.number(),
  usuario_nome: z.string(),

  quantidade_combustivel: z.union([z.number(), z.string()]),

  quantidade_oleo: z
    .union([z.number(), z.string()])
    .nullable()
    .optional(),

  periodo_uso_dias: z.coerce.number().nullable().optional(),

  hodometro: z.coerce.number().nullable().optional(),

  hodometro_quebrado: z.boolean().optional(),

  observacao: z.string().nullable().optional(),
  
  criado_em: z.string(),
  atualizado_em: z.string()
});
export type GuiaAbastecimentoReadDTO = z.infer<typeof guiaAbastecimentoReadSchema>;

// ============================================================
// DTO DE ESCRITA
// O que o frontend envia para a API.
//
// IMPORTANTE:
// Os nomes devem corresponder aos campos aceitos pelo
// GuiaWriteSerializer do backend.
// ============================================================

export const guiaAbastecimentoWriteSchema = z.object({
  data_hora: z.string().min(1),

  modalidade: z.string().min(1),

  pessoa_id: z.coerce.number(),

  veiculo_id: z.coerce.number().nullable().optional(),

  tipo_veiculo: z.string().nullable().optional(),

  veiculo_descricao: z.string().nullable().optional(),

  secretaria_id: z.coerce.number(),

  instituicao_id: z.number().nullable().optional(),

  rota_id: z.coerce.number().nullable().optional(),

  rota_manual: z.string().nullable().optional(),

  tipo_atividade_id: z.coerce.number().nullable().optional(),

  tipo_atividade_nome: z.string().optional(),

  tipo_combustivel_id: z.coerce.number(),

  quantidade_combustivel: z.union([
    z.number(), z.string()
  ]),

  quantidade_oleo: z
    .union([z.number(), z.string()])
    .nullable()
    .optional(),

  periodo_uso_dias: z.coerce.number().nullable().optional(),

  hodometro: z.coerce.number().nullable().optional(),

  hodometro_quebrado: z.boolean().optional(),

  observacao: z.string().nullable().optional()
});
export type GuiaAbastecimentoWriteDTO = z.infer<typeof guiaAbastecimentoWriteSchema>;

// ============================================================
// FILTROS DA LISTAGEM
// Estes nomes correspondem aos parâmetros de filtro da API.
// IMPORTANTE: contém APENAS params suportados pelo backend
// (GuiaAbastecimentoViewSet.filterset_fields = modalidade,
// pessoa, veiculo, secretaria). Params como rota, tipo_atividade,
// instituicao, tipo_veiculo, tipo_combustivel e usuario são
// silenciosamente ignorados pelo django-filter e foram removidos.
// ============================================================

export const guiaListParamsSchema = z.object({
  modalidade: z.string().optional(),
  pessoa: z.number().optional(),
  veiculo: z.number().optional(),
  secretaria: z.number().optional(),

  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
})
export type GuiaListParams = z.infer<typeof guiaListParamsSchema>;