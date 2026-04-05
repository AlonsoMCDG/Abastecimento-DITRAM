import { client } from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { OperadorVeiculo } from "../../types/models";
import type { PaginatedResponse } from "../../types/api";

// Permite buscar, por exemplo, "todos os motoristas do veículo X" ou "todos os veículos do motorista Y"
interface OperadorListParams {
  pessoa_id?: number;
  veiculo_id?: number;
  ativo?: boolean | "";
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// Payload focado apenas no que a API precisa para gravar no banco
interface OperadorCreatePayload {
  pessoa_id: number;
  veiculo_id: number;
  ativo?: boolean;
}

export const operadoresApi = {
  listar(params?: OperadorListParams) {
    return client.get<PaginatedResponse<OperadorVeiculo>>(ENDPOINTS.operacao.operadoresVeiculos, { params });
  },
  
  buscar(id: number) {
    return client.get<OperadorVeiculo>(`${ENDPOINTS.operacao.operadoresVeiculos}${id}/`);
  },

  criar(data: OperadorCreatePayload) {
    return client.post<OperadorVeiculo>(ENDPOINTS.operacao.operadoresVeiculos, data);
  },

  atualizar(id: number, data: Partial<OperadorCreatePayload>) {
    return client.patch<OperadorVeiculo>(`${ENDPOINTS.operacao.operadoresVeiculos}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.operacao.operadoresVeiculos}${id}/`);
  }
};
