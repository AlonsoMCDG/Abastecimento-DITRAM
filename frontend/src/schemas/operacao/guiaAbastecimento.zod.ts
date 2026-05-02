import { z } from "zod"

// ==========================================
// WRITE DTO (envio para API)
// ==========================================
export const guiaAbastecimentoWriteSchema = z.object({
  data_hora: z.string().min(1, "Data e hora obrigatórias"),

  modalidade: z.string().min(1),

  pessoa_id: z.number(),

  // Regra XOR (validada depois)
  veiculo_id: z.number().nullable().optional(),
  tipo_veiculo: z.string().nullable().optional(),
  veiculo_descricao: z.string().nullable().optional(),

  secretaria_id: z.number(),
  instituicao_id: z.number().nullable().optional(),

  rota_id: z.number().nullable().optional(),
  rota_manual: z.string().nullable().optional(),

  tipo_atividade_id: z.number().nullable().optional(),
  tipo_atividade_nome: z.string().optional(),

  tipo_combustivel_id: z.number(),

  quantidade_combustivel: z.union([z.number(), z.string()]),
  quantidade_oleo: z.union([z.number(), z.string()]).nullable().optional(),

  periodo_uso_dias: z.number().nullable().optional(),

  observacao: z.string().nullable().optional()
})
.superRefine((data, ctx) => {
  // ==========================================
  // REGRA XOR VEÍCULO
  // ==========================================
  const count = [
    data.veiculo_id,
    data.tipo_veiculo,
    data.veiculo_descricao
  ].filter(Boolean).length

  if (count !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe exatamente um: veículo, tipo ou descrição.",
      path: ["veiculo_id"]
    })
  }

  // ==========================================
  // REGRA TIPO ATIVIDADE
  // ==========================================
  if (!data.tipo_atividade_id && !data.tipo_atividade_nome) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe tipo_atividade_id ou tipo_atividade_nome.",
      path: ["tipo_atividade_id"]
    })
  }

  if (data.tipo_atividade_id && data.tipo_atividade_nome) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Informe apenas um: tipo_atividade_id OU tipo_atividade_nome.",
      path: ["tipo_atividade_id"]
    })
  }
})


// ==========================================
// READ DTO (resposta da API)
// ==========================================
export const guiaAbastecimentoReadSchema = z.object({
  id: z.number(),
  data_hora: z.string(),

  modalidade: z.string(),
  modalidade_nome: z.string().optional(),

  pessoa_id: z.number(),
  pessoa_nome: z.string().optional(),

  veiculo_id: z.number().nullable().optional(),
  veiculo_display: z.string().optional(),

  secretaria_id: z.number(),
  secretaria_nome: z.string().optional(),
  secretaria_sigla: z.string().optional(),

  instituicao_id: z.number().nullable().optional(),
  instituicao_nome: z.string().optional(),

  rota_id: z.number().nullable().optional(),
  rota_nome: z.string().nullable().optional(),

  tipo_atividade_id: z.number().nullable().optional(),
  tipo_atividade_nome: z.string().optional(),

  tipo_combustivel_id: z.number(),
  tipo_combustivel_nome: z.string().optional(),

  usuario_id: z.number().optional(),
  usuario_nome: z.string().optional(),

  quantidade_combustivel: z.union([z.number(), z.string()]),
  quantidade_oleo: z.union([z.number(), z.string()]).nullable().optional(),

  periodo_uso_dias: z.number().nullable().optional(),

  observacao: z.string().nullable().optional(),
  rota_manual: z.string().nullable().optional(),

  criado_em: z.string().optional(),
  atualizado_em: z.string().optional()
})


// ==========================================
// TYPES
// ==========================================
export type GuiaAbastecimentoWriteDTO = z.infer<typeof guiaAbastecimentoWriteSchema>
export type GuiaAbastecimentoReadDTO = z.infer<typeof guiaAbastecimentoReadSchema>
