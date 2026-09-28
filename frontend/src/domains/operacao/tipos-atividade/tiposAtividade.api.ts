import { createCrudApi } from "../../../core/api/crudFactory";
import { ENDPOINTS } from "../../../core/api/endpoints";

import { tipoAtividadeReadSchema } from "./schemas/tipoAtividade.read.zod";
import { tipoAtividadeWriteSchema } from "./schemas/tipoAtividade.write.zod";
import type { TipoAtividadeListParams } from "./schemas/tipoAtividade.filters.zod";

// Certifique-se de que ENDPOINTS.operacao.tiposAtividade existe no seu arquivo de endpoints!
export const tiposAtividadeApi = createCrudApi<
  typeof tipoAtividadeReadSchema,
  typeof tipoAtividadeWriteSchema,
  TipoAtividadeListParams
>({
  endpoint: ENDPOINTS.operacao.tiposAtividade, 
  readSchema: tipoAtividadeReadSchema,
  writeSchema: tipoAtividadeWriteSchema
});