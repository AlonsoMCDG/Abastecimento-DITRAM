import { z } from 'zod';

export const guiaAbastecimentoFormSchema = z.object({
  data_hora: z.string().min(1, 'A data e hora são obrigatórias.'),
  modalidade: z.string().min(1, 'Informe o tipo de guia / operação.'),
  secretaria_id: z.coerce.number().min(1, 'Selecione a secretaria.'),
  pessoa_id: z.coerce.number().min(1, 'Selecione o motorista / condutor.'),

  veiculo: z.union([z.number(), z.string()]).nullable().optional(),
  tipo_veiculo: z.string().nullable().optional(),

  instituicao_id: z.coerce.number().nullable().optional(),

  rota_manual: z.string().trim().min(1, 'Informe a rota ou serviço.'),

  tipo_combustivel_id: z.coerce.number().min(1, 'Selecione o tipo de combustível.'),

  quantidade_combustivel: z.union([z.number(), z.string()]).refine(
    (value) => value !== '' && !isNaN(Number(value)) && Number(value) > 0,
    { message: 'Informe uma quantidade válida e maior que zero.' }
  ),

  quantidade_oleo: z.union([z.number(), z.string()])
    .nullable()
    .optional()
    .refine(
      (value) => value == null || value === '' || (!isNaN(Number(value)) && Number(value) >= 0),
      { message: 'Informe uma quantidade válida de óleo.' }
    ),

  periodo_uso_dias: z.coerce.number().nullable().optional(),

  hodometro: z.coerce.number()
    .min(0, 'O hodômetro não pode ser negativo.')
    .nullable()
    .optional(),

  hodometro_quebrado: z.boolean().default(false).optional(),

  observacao: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  const filled = data.veiculo !== null &&
    data.veiculo !== undefined &&
    String(data.veiculo).trim() !== '';

  if (!filled) {
    ctx.addIssue({
      code: 'custom',
      message: 'Selecione um veículo ou descreva o equipamento abastecido.',
      path: ['veiculo'],
    });
  }

  if (
    data.hodometro_quebrado &&
    data.hodometro != null &&
    String(data.hodometro) !== ''
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Deixe o hodômetro vazio quando ele estiver quebrado/não disponível.',
      path: ['hodometro'],
    });
  }
});

export type GuiaAbastecimentoFormInput = z.input<typeof guiaAbastecimentoFormSchema>;
export type GuiaAbastecimentoFormOutput = z.output<typeof guiaAbastecimentoFormSchema>;
