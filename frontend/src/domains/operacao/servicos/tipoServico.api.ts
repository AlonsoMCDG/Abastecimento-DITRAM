import { client } from "../../../core/api/apiClient";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type { TipoServico } from "../../../core/types/models"
import type { PaginatedResponse } from "../../../core/types/api";

interface TipoServicoListParams {
  nome?: string;
  ativo?: boolean | string;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

type TipoServicoCreatePayload = Omit<TipoServico, "id">;

export const tiposServicoApi = {
  listar(params?: TipoServicoListParams) {
    return client.get<PaginatedResponse<TipoServico>>(ENDPOINTS.operacao.tiposServico, { params });
  },
  
  buscar(id: number) {
    return client.get<TipoServico>(`${ENDPOINTS.operacao.tiposServico}${id}/`);
  },

  criar(data: TipoServicoCreatePayload) {
    return client.post<TipoServico>(ENDPOINTS.operacao.tiposServico, data);
  },

  atualizar(id: number, data: Partial<TipoServicoCreatePayload>) {
    return client.patch<TipoServico>(`${ENDPOINTS.operacao.tiposServico}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.operacao.tiposServico}${id}/`);
  }
};