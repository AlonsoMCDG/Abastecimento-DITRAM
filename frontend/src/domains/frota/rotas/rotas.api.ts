import { createCrudApi } from "../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../core/api/endpoints";

import { rotaReadSchema } from "./schemas/rota.read.zod";
import { rotaWriteSchema } from "./schemas/rota.write.zod";
import type { RotaListParams } from "./schemas/rota.filters.zod";

export const rotasApi = createCrudApi<
  typeof rotaReadSchema,
  typeof rotaWriteSchema,
  RotaListParams
>({
  endpoint: ENDPOINTS.frota.rotas,
  readSchema: rotaReadSchema,
  writeSchema: rotaWriteSchema
});