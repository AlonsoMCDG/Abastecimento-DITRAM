import { client } from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { AlocacaoServico } from "../../types/models";
import type { PaginatedResponse } from "../../types/api";

// Filtros excelentes para carregar apenas os serviços de uma pessoa específica
interface AlocacaoListParams {
  pessoa_id?: number;
  tipo_servico_id?: number;
  is_principal?: boolean;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// O Payload envia apenas os IDs esperados pelo WriteSerializer do DRF
interface AlocacaoCreatePayload {
  pessoa_id: number;
  tipo_servico_id: number;
  is_principal?: boolean;
}

export const alocacoesApi = {
  listar(params?: AlocacaoListParams) {
    return client.get<PaginatedResponse<AlocacaoServico>>(ENDPOINTS.operacao.alocacoesServico, { params });
  },
  
  buscar(id: number) {
    return client.get<AlocacaoServico>(`${ENDPOINTS.operacao.alocacoesServico}${id}/`);
  },

  criar(data: AlocacaoCreatePayload) {
    return client.post<AlocacaoServico>(ENDPOINTS.operacao.alocacoesServico, data);
  },

  atualizar(id: number, data: Partial<AlocacaoCreatePayload>) {
    return client.patch<AlocacaoServico>(`${ENDPOINTS.operacao.alocacoesServico}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.operacao.alocacoesServico}${id}/`);
  }
};
