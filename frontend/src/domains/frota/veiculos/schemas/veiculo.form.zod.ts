import { z } from "zod";

// Helper para transformar strings do IMask em números válidos (ou null se vazio)
const numberTransform = z.union([z.string(), z.number()]).optional().nullable().transform(val => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return val;
  const num = Number(val.replace(',', '.'));
  return isNaN(num) ? null : num;
});

export const veiculoFormSchema = z.object({
  categoria: z.string().min(1, "Selecione a categoria do veículo."),
  modelo: z.string().min(2, "Informe o modelo do veículo."),
  placa: z.string()
    .transform(val => val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
    .pipe(z.string().min(7, "Placa inválida.")),
  
  tipo_combustivel_id: z.number({ message: "Selecione o combustível." }).min(1, "Selecione o combustível."),
  unidade_consumo: z.string().default("KM_POR_L"),
  
  hodometro_atual: z.union([z.string(), z.number()]).transform(val => {
    if (typeof val === 'number') return val;
    const num = Number(val?.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }),
  
  consumo_estimado_combustivel: numberTransform,
  consumo_estimado_oleo: numberTransform,
  capacidade_carga_kg: numberTransform,
  capacidade_pessoas: numberTransform,
  
  ativo: z.boolean().default(true),
});

export type VeiculoFormData = z.infer<typeof veiculoFormSchema>;