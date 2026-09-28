import { z } from "zod";

export const tipoCombustivelListParamsSchema = z.object({
  ativo: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type TipoCombustivelListParams = z.infer<typeof tipoCombustivelListParamsSchema>;