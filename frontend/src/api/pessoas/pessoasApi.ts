import { client } from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";
import type { Pessoa } from "../../types/models";
import type { PaginatedResponse } from "../../types/api";

// Filtros Exatos e Motores de Busca do DRF
interface PessoaListParams {
  cpf?: string;
  ativo?: boolean | "";
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// (O banco de dados cuida do ID)
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

  // Permite enviar apenas { ativo: false } sem quebrar o TypeScript
  atualizar(id: number, data: Partial<PessoaCreatePayload>) {
    return client.patch<Pessoa>(`${ENDPOINTS.pessoas.base}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.pessoas.base}${id}/`);
  }

};