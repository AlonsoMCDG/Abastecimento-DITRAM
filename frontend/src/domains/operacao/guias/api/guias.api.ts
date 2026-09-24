import { createCrudApi } from "../../../../core/api/crudFactory";
import { client } from "../../../../core/api/apiClient"
import { ENDPOINTS } from "../../../../core/api/endpoints";

import {
  guiaAbastecimentoReadSchema,
  guiaAbastecimentoWriteSchema,
  type GuiaListParams,
  type SugestoesPessoaDTO,
  type RelatorioConsolidadoDTO
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

// Estende a API base com os métodos específicos da Guia (PDF, Sugestões, Relatórios)
export const guiasApi = {
  ...baseCrud,

  async obterPdfBlob(id: number): Promise<Blob> {
    const response = await client.get(
      `${ENDPOINTS.operacao.guias}${id}/pdf/`,
      { responseType: "blob" }
    )
    return response.data
  },

  async obterSugestoes(pessoaId: number): Promise<SugestoesPessoaDTO> {
    const response = await client.get(ENDPOINTS.operacao.guiasSugestoes, {
      params: { pessoa: pessoaId }
    });
    return response.data;
  },

  async obterRelatorioConsolidado(params?: {
    data_inicio?: string;
    data_fim?: string;
    secretaria?: number;
    tipo_combustivel?: number;
  }): Promise<RelatorioConsolidadoDTO> {
    const response = await client.get(ENDPOINTS.operacao.guiasRelatorioConsolidado, {
      params
    });
    return response.data;
  }
}