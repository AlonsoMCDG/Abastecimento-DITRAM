import { z } from "zod";

export const rotaFormSchema = z.object({
  nome: z.string().min(2, "O nome da rota é obrigatório."),
  secretaria_id: z.number({ message: "Selecione a secretaria vinculada." }).min(1, "Selecione a secretaria vinculada."),
  
  distancia_km: z.union([z.string(), z.number()]).optional().nullable().transform(val => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return val;
    const num = Number(val.replace(',', '.'));
    return isNaN(num) ? null : num;
  }),
  
  detalhes: z.string().optional().nullable(),
  ativa: z.boolean().default(true),
});

export type RotaFormData = z.infer<typeof rotaFormSchema>;