import { z } from "zod";

export const instituicaoListParamsSchema = z.object({
  tipo: z.string().optional(),
  secretaria: z.number().optional(), // Bate com o filterset do DRF
  ativo: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(), // "nome" não é filterset no backend; use search
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type InstituicaoListParams = z.infer<typeof instituicaoListParamsSchema>;