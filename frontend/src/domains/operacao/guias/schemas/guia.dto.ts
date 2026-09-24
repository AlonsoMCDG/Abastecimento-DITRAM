import { z } from "zod";

export const guiaAbastecimentoReadSchema = z.object({
  id: z.number(),
  data_hora: z.string(),
  modalidade: z.string(),
  modalidade_nome: z.string().optional(),

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
  tipo_atividade_nome: z.string().nullable().optional(),

  tipo_combustivel_id: z.coerce.number(),
  tipo_combustivel_nome: z.string(),

  usuario_id: z.coerce.number(),
  usuario_nome: z.string(),

  quantidade_combustivel: z.union([z.number(), z.string()]),
  quantidade_oleo: z.union([z.number(), z.string()]).nullable().optional(),
  periodo_uso_dias: z.coerce.number().nullable().optional(),
  hodometro: z.coerce.number().nullable().optional(),
  hodometro_quebrado: z.boolean().optional(),
  observacao: z.string().nullable().optional(),

  criado_em: z.string(),
  atualizado_em: z.string(),
});

export type GuiaAbastecimentoReadDTO = z.infer<typeof guiaAbastecimentoReadSchema>;

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

  quantidade_combustivel: z.union([z.number(), z.string()]),
  quantidade_oleo: z.union([z.number(), z.string()]).nullable().optional(),
  periodo_uso_dias: z.coerce.number().nullable().optional(),
  hodometro: z.coerce.number().nullable().optional(),
  hodometro_quebrado: z.boolean().optional(),
  observacao: z.string().nullable().optional(),
});

export type GuiaAbastecimentoWriteDTO = z.infer<typeof guiaAbastecimentoWriteSchema>;

export const guiaListParamsSchema = z.object({
  modalidade: z.string().optional(),
  pessoa: z.number().optional(),
  veiculo: z.number().optional(),
  secretaria: z.number().optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type GuiaListParams = z.infer<typeof guiaListParamsSchema>;

export interface SugestoesPessoaDTO {
  tipo_atividade?: { value: number; label: string } | null;
  veiculo?: {
    value: number;
    label: string;
    tipo_combustivel_id?: number | null;
    consumo_estimado_combustivel?: number | null;
    unidade_consumo?: string | null;
    hodometro_atual?: number | null;
  } | null;
  secretaria?: { value: number; label: string; sigla: string } | null;
  modalidade?: string | null;
  rota?: { value: number; label: string; distancia_km?: number | null } | null;
}

export interface RelatorioConsolidadoDTO {
  periodo: {
    data_inicio: string | null;
    data_fim: string | null;
  };
  kpis: {
    total_combustivel: number;
    total_oleo: number;
    total_guias: number;
    total_veiculos: number;
  };
  por_secretaria: Array<{
    secretaria_id: number;
    nome: string;
    sigla: string;
    total_guias: number;
    total_combustivel: number;
    total_oleo: number;
  }>;
  por_tipo_combustivel: Array<{
    tipo_combustivel_id: number;
    nome: string;
    total_guias: number;
    total_litros: number;
    percentual: number;
  }>;
  por_modalidade: Array<{
    modalidade: string;
    modalidade_nome: string;
    total_guias: number;
    total_litros: number;
    total_oleo: number;
    percentual: number;
  }>;
}
