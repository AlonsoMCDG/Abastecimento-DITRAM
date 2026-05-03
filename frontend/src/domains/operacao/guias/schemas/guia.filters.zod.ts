import { z } from "zod"

export const guiaListParamsSchema = z.object({
  pessoa: z.number().optional(),
  veiculo: z.number().optional(),
  secretaria: z.number().optional(),
  rota: z.number().optional(),
  tipo_atividade: z.number().optional(),
  instituicao: z.number().optional(),
  tipo_veiculo: z.string().optional(),
  tipo_combustivel: z.number().optional(),
  usuario: z.number().optional(),

  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
})

export type GuiaListParams = z.infer<typeof guiaListParamsSchema>