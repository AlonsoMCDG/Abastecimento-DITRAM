import { z } from "zod";

// Helper para transformar strings do IMask em números válidos (ou null se vazio)
const nullableNumberFromInput = z
  .union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (typeof value === "number") {
      return value;
    }

    const number = Number(value.replace(",", "."));

    return Number.isNaN(number) ? null : number;
  });

export const veiculoFormSchema = z.object({
  categoria: z
    .string({
      message: "Categoria inválida.",
    })
    .min(1, "Selecione a categoria do veículo."),

  modelo: z
    .string({
      message: "Modelo inválido.",
    })
    .min(2, "Informe o modelo do veículo."),

  placa: z
    .string({
      message: "Placa inválida.",
    })
    .transform((val) =>
      val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    )
    .pipe(
      z.string().min(7, "Placa inválida.")
    ),

  tipo_combustivel_id: z
    .coerce
    .number({
      message: "Combustível inválido.",
    })
    .min(1, "Selecione o combustível."),

  unidade_consumo: z
    .string({
      message: "Unidade de consumo inválida.",
    })
    .min(1, "Selecione a unidade de consumo."),

  hodometro_atual: nullableNumberFromInput
    .refine(
      (value) => value !== null && value >= 0,
      "O hodômetro não pode ser negativo."
    ),

  consumo_estimado_combustivel:
    nullableNumberFromInput.refine(
      (value) => value === null || value >= 0,
      "O consumo não pode ser negativo."
    ),

  consumo_estimado_oleo:
    nullableNumberFromInput.refine(
      (value) => value === null || value >= 0,
      "O consumo de óleo não pode ser negativo."
    ),

  capacidade_carga_kg:
    nullableNumberFromInput.refine(
      (value) => value === null || value >= 0,
      "A capacidade de carga não pode ser negativa."
    ),

  capacidade_pessoas:
    nullableNumberFromInput.refine(
      (value) =>
        value === null ||
        (value >= 0 && Number.isInteger(value)),
      "A capacidade de pessoas deve ser um número inteiro não negativo."
    ),

  ativo: z.boolean().default(true),
});

// O Input representa o que o formulário "digita" (pode ser string/unknown antes da coerção)
export type veiculoFormInput = z.input<typeof veiculoFormSchema>;

// O Output representa o dado limpo e transformado (o que vai para a API)
export type veiculoFormOutput = z.output<typeof veiculoFormSchema>;