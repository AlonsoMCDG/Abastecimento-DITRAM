import { z } from "zod"

export const guiaAbastecimentoFormSchema = z.object({
  data_hora: z.string({
    message: "Data e hora inválidas.",
  }).min(1, "A data e hora são obrigatórias."),

  modalidade: z.string({
    message: "Modalidade inválida.",
  }).min(1, "Selecione a modalidade da guia."),

  pessoa_id: z.coerce.number({
    message: "Pessoa inválida.",
  }).min(1, "Selecione a pessoa."),

  // Veículo Unificado (ID ou Texto Livre)
  veiculo: z.union([
    z.number({ message: "ID do veículo inválido." }), 
    z.string({ message: "Descrição do veículo inválida." })
  ], { message: "Veículo inválido." }).nullable().optional(),

  tipo_veiculo: z.string({
    message: "Categoria do veículo inválida.",
  }).nullable().optional(),

  secretaria_id: z.coerce.number({
    message: "Secretaria inválida.",
  }).min(1, "Selecione a secretaria."),

  instituicao_id: z.coerce.number({
    message: "Instituição inválida."
  }).nullable().optional(),
  
  // Rota Unificada (ID ou Rota Livre)
  rota: z.union([
    z.number({ message: "ID da rota inválido." }), 
    z.string({ message: "Descrição da rota inválida." })
  ], { message: "Rota inválida." }).nullable().optional(),

  tipo_atividade: z.union([
    z.number({ message: "ID da atividade inválido." }), 
    z.string({ message: "Nome da atividade inválido." })
  ], { message: "Selecione ou digite a atividade." }),

  tipo_combustivel_id: z.coerce.number({
    message: "Tipo de combustível inválido.",
  }).min(1, "Selecione o tipo de combustível."),

  // Quantidade de Combustível (Aceita número ou string, mas valida se é um valor numérico válido)
  quantidade_combustivel: z.union([
    z.number({ message: "Quantidade inválida." }), 
    z.string({ message: "Quantidade inválida." })
  ], { message: "Informe a quantidade de combustível." })
  .refine((val) => val !== "" && !isNaN(Number(val)) && Number(val) > 0, {
    message: "Informe uma quantidade válida e maior que zero.",
  }),

  // Quantidade de Óleo (Opcional, mas se preenchido, deve ser um valor numérico válido)
  quantidade_oleo: z.union([
    z.number({ message: "Quantidade de óleo inválida." }), 
    z.string({ message: "Quantidade de óleo inválida." })
  ], { message: "Quantidade de óleo inválida." })
  .nullable()
  .optional()
  .refine((val) => val == null || val === "" || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: "Se informado, o óleo deve ter uma quantidade válida.",
  }),

  periodo_uso_dias: z.coerce.number({
    message: "Período de uso inválido.",
  }).nullable().optional(),

  hodometro: z.coerce.number({
    message: "Hodômetro inválido.",
  })
  .min(0, "O hodômetro não pode ser negativo.")
  .nullable().optional(),
  
  hodometro_quebrado: z.boolean().default(false).optional(),

  observacao: z.string({
    message: "Observação inválida.",
  }).nullable().optional()
})
.superRefine((data, ctx) => {
  const isBarqueiro = data.modalidade === 'CATRAIA';
  const isVeiculoFilled = data.veiculo !== null && data.veiculo !== undefined && String(data.veiculo).trim() !== '';
  const isVeiculoAvulso = typeof data.veiculo === 'string';
  const isTipoFilled = typeof data.tipo_veiculo === 'string' && data.tipo_veiculo.trim() !== '';

  if (!isBarqueiro) {
    // 1. Se não for barqueiro, TEM que ter veículo preenchido
    if (!isVeiculoFilled) {
      ctx.addIssue({
        code: "custom",
        message: "Selecione a placa ou descreva o veículo.",
        path: ["veiculo"]
      });
    } 
    // 2. Se o veículo for uma descrição em texto, o TIPO passa a ser obrigatório
    else if (isVeiculoAvulso && !isTipoFilled) {
      ctx.addIssue({
        code: "custom",
        message: "Para veículos avulsos, selecione a categoria.",
        path: ["tipo_veiculo"] 
      });
    }
  }
});

// O Input representa o que o formulário "digita" (pode ser string/unknown antes da coerção)
export type GuiaAbastecimentoFormInput = z.input<typeof guiaAbastecimentoFormSchema>;

// O Output representa o dado limpo e transformado (o que vai para a API)
export type GuiaAbastecimentoFormOutput = z.output<typeof guiaAbastecimentoFormSchema>;