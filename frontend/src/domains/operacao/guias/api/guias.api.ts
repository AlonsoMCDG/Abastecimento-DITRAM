import { createCrudApi } from "../../../../core/api/crudFactory";
import { client } from "../../../../core/api/apiClient"
import { ENDPOINTS } from "../../../../core/api/endpoints";

import {
  guiaAbastecimentoReadSchema,
  guiaAbastecimentoWriteSchema,
  type GuiaListParams
} from "../schemas/guia.dto"; 

// Cria os métodos base (listar, buscar, criar, atualizar, deletar)
const baseCrud = createCrudApi<
  typeof guiaAbastecimentoReadSchema,
  typeof guiaAbastecimentoWriteSchema,
  GuiaListParams
>({
  endpoint: ENDPOINTS.operacao.guias,
  readSchema: guiaAbastecimentoReadSchema,
  writeSchema: guiaAbastecimentoWriteSchema
})

// Estende a API base com os métodos específicos da Guia (PDF)
export const guiasApi = {
  ...baseCrud,

  async obterPdfBlob(id: number): Promise<Blob> {
    const response = await client.get(
      `${ENDPOINTS.operacao.guias}${id}/pdf/`,
      { responseType: "blob" }
    )
    return response.data
  }
}