import { client } from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { Secretaria } from "../../types/models";
import type { PaginatedResponse } from "../../types/api";

interface SecretariaListParams {
  nome?: string;
  sigla?: string;
  ativo?: boolean | string;
  search?: string; 
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

type SecretariaCreatePayload = Omit<Secretaria, "id">;

export const secretariaApi = {
  listar(params?: SecretariaListParams) {
    return client.get<PaginatedResponse<Secretaria>>(ENDPOINTS.organizacao.secretarias, { params });
  },
  
  buscar(id: number) {
    return client.get<Secretaria>(`${ENDPOINTS.organizacao.secretarias}${id}/`);
  },

  criar(data: SecretariaCreatePayload) {
    return client.post<Secretaria>(ENDPOINTS.organizacao.secretarias, data);
  },

  atualizar(id: number, data: Partial<SecretariaCreatePayload>) {
    return client.patch<Secretaria>(`${ENDPOINTS.organizacao.secretarias}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.organizacao.secretarias}${id}/`);
  }
};