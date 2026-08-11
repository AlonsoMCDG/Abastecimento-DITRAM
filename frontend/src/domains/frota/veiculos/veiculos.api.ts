import { createCrudApi } from "../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../core/api/endpoints";

import { veiculoReadSchema } from "./schemas-zod/veiculo.read.zod";
import { veiculoWriteSchema } from "./schemas-zod/veiculo.write.zod";
import type { VeiculoListParams } from "./schemas-zod/veiculo.filters.zod";

export const veiculosApi = createCrudApi<
  typeof veiculoReadSchema,
  typeof veiculoWriteSchema,
  VeiculoListParams
>({
  endpoint: ENDPOINTS.frota.veiculos,
  readSchema: veiculoReadSchema,
  writeSchema: veiculoWriteSchema
});