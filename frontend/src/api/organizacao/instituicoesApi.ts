import { client } from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { Instituicao } from "../../types/models";
import type { PaginatedResponse } from "../../types/api";

interface InstituicaoListParams {
  nome?: string;
  tipo?: string;
  // Filtra id para fazer combos em cascata (Select dependente)
  secretaria_id?: number; 
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

type InstituicaoCreatePayload = Omit<Instituicao, "id">;

export const instituicoesApi = {
  listar(params?: InstituicaoListParams) {
    return client.get<PaginatedResponse<Instituicao>>(ENDPOINTS.organizacao.instituicoes, { params });
  },
  
  buscar(id: number) {
    return client.get<Instituicao>(`${ENDPOINTS.organizacao.instituicoes}${id}/`);
  },

  criar(data: InstituicaoCreatePayload) {
    return client.post<Instituicao>(ENDPOINTS.organizacao.instituicoes, data);
  },

  atualizar(id: number, data: Partial<InstituicaoCreatePayload>) {
    return client.patch<Instituicao>(`${ENDPOINTS.organizacao.instituicoes}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.organizacao.instituicoes}${id}/`);
  }
};