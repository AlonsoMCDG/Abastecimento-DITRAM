import { client } from "../../../core/api/apiClient";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type { Instituicao } from "../../../core/types/models";
import type { PaginatedResponse } from "../../../core/types/api";

interface InstituicaoListParams {
  nome?: string;
  tipo?: string;
  secretaria_id?: number; 
  ativo?: boolean | string;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// Omite o ID e os campos de exibição ("_nome", "_sigla") que o banco não aceita na gravação
type InstituicaoCreatePayload = Omit<Instituicao, "id" | "secretaria_nome" | "secretaria_sigla" | "tipo_nome">;

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