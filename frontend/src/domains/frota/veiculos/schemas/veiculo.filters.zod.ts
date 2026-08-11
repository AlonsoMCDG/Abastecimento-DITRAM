import { z } from "zod";

export const veiculoListParamsSchema = z.object({
  id: z.number().optional(),
  categoria: z.string().optional(),
  tipo_combustivel: z.number().optional(),
  ativo: z.union([z.boolean(), z.string()]).optional(),
  pessoa_id: z.number().optional(), // Filtro customizado da ViewSet
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type VeiculoListParams = z.infer<typeof veiculoListParamsSchema>;