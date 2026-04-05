import { client } from "../config/apiClient"
import { ENDPOINTS } from "../config/endpoints"
import type { Veiculo } from "../../types/models"
import type { PaginatedResponse } from "../../types/api";

// Tipagem para os filtros
interface VeiculoListParams {
  // Filtros Exatos (filterset_fields do Django)
  id?: number;
  secretaria_id?: number;
  tipo_locomocao?: string;
  tipo_combustivel?: string;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

type VeiculoCreatePayload = Omit<Veiculo, "id">;

export const veiculosApi = {

  listar(params?: VeiculoListParams) {
    return client.get<PaginatedResponse<Veiculo>>(ENDPOINTS.frota.veiculos, { params });
  },
  
  buscar(id: number) {
    return client.get<Veiculo>(`${ENDPOINTS.frota.veiculos}${id}/`);
  },

  criar(data: VeiculoCreatePayload) {
    return client.post<Veiculo>(ENDPOINTS.frota.veiculos, data);
  },

  atualizar(id: number, data: Partial<VeiculoCreatePayload>) {
    return client.patch<Veiculo>(`${ENDPOINTS.frota.veiculos}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.frota.veiculos}${id}/`);
  }

}