import { client } from "../../../core/api/apiClient"
import { ENDPOINTS } from "../../../core/api/endpoints";
import type { Rota } from "../../../core/types/models"
import type { PaginatedResponse } from "../../../core/types/api";

// Tipagem específica para os filtros, facilitando a manutenção
interface RotaListParams {
  secretaria?: number;
  instituicao?: number;
  ativa?: boolean | "";
  tipo_locomocao?: string;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number; 
}

// Omitimos o 'id' para a criação, pois o banco de dados é quem vai gerá-lo
type RotaCreatePayload = Omit<Rota, "id">;

export const rotaApi = {
 
  listar(params?: RotaListParams) {
    return client.get<PaginatedResponse<Rota>>(ENDPOINTS.frota.rotas, { params })
  },
  
  buscar(id: number) {
    return client.get<Rota>(`${ENDPOINTS.frota.rotas}${id}/`);
  },

  criar(data: RotaCreatePayload) {
    return client.post<Rota>(ENDPOINTS.frota.rotas, data);
  },

  atualizar(id: number, data: Partial<RotaCreatePayload>) {
    return client.patch<Rota>(`${ENDPOINTS.frota.rotas}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.frota.rotas}${id}/`);
  }

}
