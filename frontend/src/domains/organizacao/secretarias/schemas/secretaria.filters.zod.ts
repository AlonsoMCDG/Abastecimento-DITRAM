import { z } from "zod";

export const secretariaListParamsSchema = z.object({
  nome: z.string().optional(),
  sigla: z.string().optional(),
  ativo: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type SecretariaListParams = z.infer<typeof secretariaListParamsSchema>;