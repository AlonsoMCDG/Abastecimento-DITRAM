import { z } from "zod"

// ==========================================
// WRITE DTO (envio para API)
// ==========================================
export const guiaAbastecimentoWriteSchema = z.object({
  data_hora: z.string().min(1),

  modalidade: z.string().min(1),

  pessoa_id: z.coerce.number(),

  // Identificação do Veículo
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

  observacao: z.string().nullable().optional()
})
.superRefine((data, ctx) => {
  
  // -------------------------
  // REGRA DO VEÍCULO (FK Exclusiva vs Par Avulso)
  // -------------------------
  const tem_fk = data.veiculo_id != null && data.veiculo_id > 0;
  const tem_tipo = !!data.tipo_veiculo?.trim();
  const tem_desc = !!data.veiculo_descricao?.trim();

  if (tem_fk) {
    if (tem_tipo || tem_desc) {
      ctx.addIssue({
        code: "custom",
        message: "Se informar o veículo cadastrado, não envie categoria ou descrição.",
        path: ["veiculo_id"]
      });
    }
  } else {
    if (!tem_tipo || !tem_desc) {
      ctx.addIssue({
        code: "custom",
        message: "Para veículos avulsos ou embarcações, informe obrigatoriamente a descrição e a categoria.",
        path: ["veiculo_descricao"] // Atrela o erro ao campo que unificamos na tela
      });
    }
  }

  // -------------------------
  // ATIVIDADE
  // -------------------------
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