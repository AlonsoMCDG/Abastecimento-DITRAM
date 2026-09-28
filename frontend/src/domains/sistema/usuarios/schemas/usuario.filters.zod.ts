import { z } from "zod";

export const usuarioListParamsSchema = z.object({
  is_staff: z.union([z.boolean(), z.string()]).optional(),
  is_superuser: z.union([z.boolean(), z.string()]).optional(),
  is_active: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type UsuarioListParams = z.infer<typeof usuarioListParamsSchema>;