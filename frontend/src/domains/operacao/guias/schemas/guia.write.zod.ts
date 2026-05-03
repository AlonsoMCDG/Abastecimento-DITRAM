import { z } from "zod"

// ==========================================
// WRITE DTO (envio para API)
// ==========================================
export const guiaAbastecimentoWriteSchema = z.object({
  data_hora: z.string().min(1),

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
  
  // XOR VEÍCULO
  const fields = [
    data.veiculo_id != null && data.veiculo_id > 0,
    !!data.tipo_veiculo,
    !!data.veiculo_descricao
  ]

  const count = fields.filter(Boolean).length

  if (count !== 1) {
    ctx.addIssue({
      code: "custom",
      message: "Informe exatamente um: veículo, tipo ou descrição.",
      path: ["veiculo_id"]
    })
  }

  // ATIVIDADE
  if (!data.tipo_atividade_id && !data.tipo_atividade_nome) {
    ctx.addIssue({
      code: "custom",
      message: "Informe tipo_atividade_id ou tipo_atividade_nome.",
      path: ["tipo_atividade_id"]
    })
  }

  if (data.tipo_atividade_id && data.tipo_atividade_nome) {
    ctx.addIssue({
      code: "custom",
      message: "Informe apenas um: id OU nome.",
      path: ["tipo_atividade_id"]
    })
  }
})

export type GuiaAbastecimentoWriteDTO = z.infer<typeof guiaAbastecimentoWriteSchema>
