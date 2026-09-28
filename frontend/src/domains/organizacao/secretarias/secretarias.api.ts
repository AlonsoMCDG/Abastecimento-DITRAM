import { createCrudApi } from "../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../core/api/endpoints";

import { secretariaReadSchema } from "./schemas/secretaria.read.zod";
import { secretariaWriteSchema } from "./schemas/secretaria.write.zod";
import type { SecretariaListParams } from "./schemas/secretaria.filters.zod";

export const secretariaApi = createCrudApi<
  typeof secretariaReadSchema,
  typeof secretariaWriteSchema,
  SecretariaListParams
>({
  endpoint: ENDPOINTS.organizacao.secretarias,
  readSchema: secretariaReadSchema,
  writeSchema: secretariaWriteSchema
});