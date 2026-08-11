import { z } from "zod";

export const tipoAtividadeListParamsSchema = z.object({
  nome: z.string().optional(),
  ativo: z.union([z.boolean(), z.string()]).optional(), // Pode vir da URL como string "true"/"false"
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type TipoAtividadeListParams = z.infer<typeof tipoAtividadeListParamsSchema>;