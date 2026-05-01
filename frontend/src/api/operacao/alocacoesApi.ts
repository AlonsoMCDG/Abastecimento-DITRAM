import { client } from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { AlocacaoPessoa } from "../../types/models";
import type { PaginatedResponse } from "../../types/api";

interface AlocacaoListParams {
  pessoa_id?: number;
  tipo_servico_id?: number;
  secretaria_id?: number;
  is_principal?: boolean;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

interface AlocacaoCreatePayload {
  pessoa_id: number;
  tipo_servico_id: number;
  secretaria_id: number;
  is_principal?: boolean;
}

export const alocacoesApi = {
  listar(params?: AlocacaoListParams) {
    return client.get<PaginatedResponse<AlocacaoPessoa>>(ENDPOINTS.operacao.alocacoesServico, { params });
  },
  
  buscar(id: number) {
    return client.get<AlocacaoPessoa>(`${ENDPOINTS.operacao.alocacoesServico}${id}/`);
  },

  criar(data: AlocacaoCreatePayload) {
    return client.post<AlocacaoPessoa>(ENDPOINTS.operacao.alocacoesServico, data);
  },

  atualizar(id: number, data: Partial<AlocacaoCreatePayload>) {
    return client.patch<AlocacaoPessoa>(`${ENDPOINTS.operacao.alocacoesServico}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.operacao.alocacoesServico}${id}/`);
  }
};