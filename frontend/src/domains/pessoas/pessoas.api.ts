import { client } from "../../core/api/apiClient";
import { ENDPOINTS } from "../../core/api/endpoints";
import type { Pessoa } from "../../core/types/models";
import type { PaginatedResponse } from "../../core/types/api";

interface PessoaListParams {
  cpf?: string;
  ativo?: boolean | string;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

type PessoaCreatePayload = Omit<Pessoa, "id">;

export const pessoasApi = {
  listar(params?: PessoaListParams) {
    return client.get<PaginatedResponse<Pessoa>>(ENDPOINTS.pessoas.base, { params });
  },
  
  buscar(id: number) {
    return client.get<Pessoa>(`${ENDPOINTS.pessoas.base}${id}/`);
  },

  criar(data: PessoaCreatePayload) {
    return client.post<Pessoa>(ENDPOINTS.pessoas.base, data);
  },

  atualizar(id: number, data: Partial<PessoaCreatePayload>) {
    return client.patch<Pessoa>(`${ENDPOINTS.pessoas.base}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.pessoas.base}${id}/`);
  }
};