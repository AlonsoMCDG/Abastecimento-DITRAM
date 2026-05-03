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
.superRefine((data, ctx) => {
  // Array com booleanos indicando se os campos têm algum valor válido
  const fieldsFilled = [
    data.veiculo_id != null && data.veiculo_id > 0, // Checa se tem ID
    !!data.tipo_veiculo?.trim(),                    // Checa se tem string válida
    !!data.veiculo_descricao?.trim()                // Checa se tem string válida
  ];

  // Conta quantos deram "true"
  const count = fieldsFilled.filter(Boolean).length;

  if (count !== 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Preencha exatamente uma opção: Veículo, Tipo ou Descrição.",
      path: ["veiculo_id"] // O React Hook Form vai focar nesse campo para mostrar o erro
    });
  }
});

export type GuiaAbastecimentoFormData = z.infer<typeof guiaAbastecimentoFormSchema>