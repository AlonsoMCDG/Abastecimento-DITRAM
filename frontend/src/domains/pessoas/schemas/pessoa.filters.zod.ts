import { z } from "zod";

export const pessoaListParamsSchema = z.object({
  cpf: z.string().optional(),
  ativo: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(),
  ordering: z.string().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type PessoaListParams = z.infer<typeof pessoaListParamsSchema>;