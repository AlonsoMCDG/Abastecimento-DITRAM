import { z } from "zod";

export const rotaListParamsSchema = z.object({
  secretaria: z.number().optional(),
  ativa: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type RotaListParams = z.infer<typeof rotaListParamsSchema>;