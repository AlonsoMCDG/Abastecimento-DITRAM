import { createCrudApi } from "../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../core/api/endpoints";

import { tipoCombustivelReadSchema } from "./schemas/tipoCombustivel.read.zod";
import { tipoCombustivelWriteSchema } from "./schemas/tipoCombustivel.write.zod";
import type { TipoCombustivelListParams } from "./schemas/tipoCombustivel.filters.zod";

export const tiposCombustivelApi = createCrudApi<
  typeof tipoCombustivelReadSchema,
  typeof tipoCombustivelWriteSchema,
  TipoCombustivelListParams
>({
  endpoint: ENDPOINTS.frota.tiposCombustivel,
  readSchema: tipoCombustivelReadSchema,
  writeSchema: tipoCombustivelWriteSchema
});