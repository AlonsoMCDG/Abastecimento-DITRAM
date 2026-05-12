import { z } from "zod"

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

  tipo_atividade_id: z.coerce.number().nullable().optional(),
  tipo_atividade_nome: z.string(),

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
  rota_manual: z.string().nullable().optional(),

  criado_em: z.string(),
  atualizado_em: z.string()
})

export type GuiaAbastecimentoReadDTO = z.infer<typeof guiaAbastecimentoReadSchema>