import { createCrudApi } from "../../core/api/crudFactory";
import { ENDPOINTS } from "../../core/api/endpoints";

import { pessoaReadSchema } from "./schemas/pessoa.read.zod";
import { pessoaWriteSchema } from "./schemas/pessoa.write.zod";
import type { PessoaListParams } from "./schemas/pessoa.filters.zod";

export const pessoasApi = createCrudApi<
  typeof pessoaReadSchema,
  typeof pessoaWriteSchema,
  PessoaListParams
>({
  endpoint: ENDPOINTS.pessoas.base,
  readSchema: pessoaReadSchema,
  writeSchema: pessoaWriteSchema
});