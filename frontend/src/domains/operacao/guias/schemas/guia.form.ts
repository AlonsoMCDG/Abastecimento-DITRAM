import { z } from 'zod';

export const guiaAbastecimentoFormSchema = z.object({
  data_hora: z.string().min(1, 'A data e hora são obrigatórias.'),
  modalidade: z.string().min(1, 'Selecione o tipo do recurso abastecido.'),
  pessoa_id: z.coerce.number().min(1, 'Selecione o condutor.'),
  veiculo: z.union([z.number(), z.string()]).nullable().optional(),
  tipo_veiculo: z.string().nullable().optional(),
  secretaria_id: z.coerce.number().min(1, 'Selecione a secretaria.'),
  instituicao_id: z.coerce.number().nullable().optional(),
  rota: z.union([z.number(), z.string()]).nullable().optional(),
  tipo_atividade: z.union([z.number(), z.string()]).refine((value) => String(value).trim() !== '', {
    message: 'Informe a rota ou serviço.',
  }),
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
  hodometro: z.coerce.number().min(0, 'O hodômetro não pode ser negativo.').nullable().optional(),
  hodometro_quebrado: z.boolean().default(false).optional(),
  observacao: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  const filled = data.veiculo !== null && data.veiculo !== undefined && String(data.veiculo).trim() !== '';
  const registered = typeof data.veiculo === 'number';
  const category = typeof data.tipo_veiculo === 'string' && data.tipo_veiculo.trim() !== '';

  if (!filled) {
    ctx.addIssue({
      code: 'custom',
      message: 'Selecione um veículo ou descreva o equipamento abastecido.',
      path: ['veiculo'],
    });
  } else if (!registered && !category) {
    ctx.addIssue({
      code: 'custom',
      message: 'Informe a categoria do veículo/equipamento.',
      path: ['tipo_veiculo'],
    });
  }

  if (data.hodometro_quebrado && data.hodometro != null && String(data.hodometro) !== '') {
    ctx.addIssue({
      code: 'custom',
      message: 'Deixe o hodômetro vazio quando ele estiver quebrado/não disponível.',
      path: ['hodometro'],
    });
  }
});

export type GuiaAbastecimentoFormInput = z.input<typeof guiaAbastecimentoFormSchema>;
export type GuiaAbastecimentoFormOutput = z.output<typeof guiaAbastecimentoFormSchema>;