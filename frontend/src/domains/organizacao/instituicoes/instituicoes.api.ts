import { createCrudApi } from "../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../core/api/endpoints";

import { instituicaoReadSchema } from "./schemas/instituicao.read.zod";
import { instituicaoWriteSchema } from "./schemas/instituicao.write.zod";
import type { InstituicaoListParams } from "./schemas/instituicao.filters.zod";

export const instituicoesApi = createCrudApi<
  typeof instituicaoReadSchema,
  typeof instituicaoWriteSchema,
  InstituicaoListParams
>({
  endpoint: ENDPOINTS.organizacao.instituicoes,
  readSchema: instituicaoReadSchema,
  writeSchema: instituicaoWriteSchema
});