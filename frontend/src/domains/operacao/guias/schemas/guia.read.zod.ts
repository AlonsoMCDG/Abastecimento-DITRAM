import { z } from "zod"

export const guiaAbastecimentoReadSchema = z.object({
  id: z.number(),
  data_hora: z.string(),

  modalidade: z.string(),
  modalidade_nome: z.string(),

  pessoa_id: z.number(),
  pessoa_nome: z.string(),

  veiculo_id: z.number().nullable().optional(),
  veiculo_display: z.string(),

  secretaria_id: z.number(),
  secretaria_nome: z.string(),
  secretaria_sigla: z.string(),

  instituicao_id: z.number().nullable().optional(),
  instituicao_nome: z.string().nullable().optional(),

  rota_id: z.number().nullable().optional(),
  rota_nome: z.string().nullable().optional(),

  tipo_atividade_id: z.number().nullable().optional(),
  tipo_atividade_nome: z.string(),

  tipo_combustivel_id: z.number(),
  tipo_combustivel_nome: z.string(),

  usuario_id: z.number(),
  usuario_nome: z.string(),

  quantidade_combustivel: z.union([z.number(), z.string()]),
  
  quantidade_oleo: z.union([z.number(), z.string()]).nullable().optional(),
  periodo_uso_dias: z.number().nullable().optional(),
  observacao: z.string().nullable().optional(),
  rota_manual: z.string().nullable().optional(),

  criado_em: z.string(),
  atualizado_em: z.string()
})

export type GuiaAbastecimentoReadDTO = z.infer<typeof guiaAbastecimentoReadSchema>