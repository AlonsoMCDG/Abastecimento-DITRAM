import { z } from "zod"

export const guiaAbastecimentoReadSchema = z.object({
  id: z.number(),
  data_hora: z.string(),

  modalidade: z.string(),
  modalidade_nome: z.string(),

  pessoa_id: z.number(),
  pessoa_nome: z.string(),

  veiculo_id: z.number().nullable(),
  veiculo_display: z.string(),

  secretaria_id: z.number(),
  secretaria_nome: z.string(),
  secretaria_sigla: z.string(),

  instituicao_id: z.number().nullable(),
  instituicao_nome: z.string().nullable(),

  rota_id: z.number().nullable(),
  rota_nome: z.string().nullable(),

  tipo_atividade_id: z.number().nullable(),
  tipo_atividade_nome: z.string(),

  tipo_combustivel_id: z.number(),
  tipo_combustivel_nome: z.string(),

  usuario_id: z.number(),
  usuario_nome: z.string(),

  quantidade_combustivel: z.union([z.number(), z.string()]),
  quantidade_oleo: z.union([z.number(), z.string()]).nullable(),

  periodo_uso_dias: z.number().nullable(),

  observacao: z.string().nullable(),
  rota_manual: z.string().nullable(),

  criado_em: z.string(),
  atualizado_em: z.string()
})

export type GuiaAbastecimentoReadDTO = z.infer<typeof guiaAbastecimentoReadSchema>