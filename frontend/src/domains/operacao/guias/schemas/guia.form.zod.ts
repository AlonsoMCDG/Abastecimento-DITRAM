import { z } from "zod"

export const guiaAbastecimentoFormSchema = z.object({
  data_hora: z.string(),

  modalidade: z.string(),

  pessoa_id: z.number(),

  veiculo_id: z.number().nullable().optional(),
  tipo_veiculo: z.string().nullable().optional(),
  veiculo_descricao: z.string().nullable().optional(),

  secretaria_id: z.number(),

  rota_id: z.number().nullable().optional(),
  rota_manual: z.string().nullable().optional(),

  // CAMPO UNIFICADO
  tipo_atividade: z.object({
    value: z.number().nullable().optional(),
    label: z.string()
  }),

  tipo_combustivel_id: z.number(),

  quantidade_combustivel: z.union([z.number(), z.string()]),

  quantidade_oleo: z.union([z.number(), z.string()]).nullable().optional(),

  periodo_uso_dias: z.number().nullable().optional(),

  observacao: z.string().nullable().optional()
})

export type GuiaAbastecimentoFormData = z.infer<typeof guiaAbastecimentoFormSchema>