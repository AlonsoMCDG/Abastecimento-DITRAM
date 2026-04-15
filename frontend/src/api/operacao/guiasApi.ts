import { client } from "../config/apiClient"
import { ENDPOINTS } from "../config/endpoints";
import type { GuiaAbastecimento } from "../../types/models"
import type { PaginatedResponse } from "../../types/api";


// ==========================================
// PARÂMETROS DE BUSCA (Alinhado com o filterset_fields do Django)
// ==========================================
export interface GuiaListParams {
  pessoa_id?: number;
  veiculo_id?: number;
  secretaria_id?: number;
  rota_id?: number;
  tipo_servico_id?: number;
  instituicao_id?: number;
  tipo_veiculo_id?: number;
  tipo_combustivel_id?: number;
  usuario_id?: number; // Para filtrar quem emitiu
  
  search?: string;     // Busca textual (Placa, Nome, CPF, Sigla)
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// ==========================================
// PAYLOAD DE ESCRITA (Alinhado com GuiaWriteSerializer)
// ==========================================
// Removemos rigorosamente todos os campos "Read-Only" gerados pelo backend
export type GuiaCreatePayload = Omit<
  GuiaAbastecimento,
  | "id"
  | "pessoa_nome"
  | "veiculo_placa"
  | "rota_nome"
  | "tipo_servico_nome"
  | "secretaria_nome"
  | "secretaria_sigla"
  | "instituicao_display"
  | "tipo_veiculo_id_display"
  | "tipo_combustivel_nome"
  | "usuario_nome"
>;

export const guiasApi = {

  listar(params?: GuiaListParams) {
    return client.get<PaginatedResponse<GuiaAbastecimento>>(ENDPOINTS.operacao.guias, { params });
  },
  
  buscar(id: number) {
    return client.get<GuiaAbastecimento>(`${ENDPOINTS.operacao.guias}${id}/`);
  },

  criar(data: GuiaCreatePayload) {
    return client.post<GuiaAbastecimento>(ENDPOINTS.operacao.guias, data);
  },

  atualizar(id: number, data: Partial<GuiaCreatePayload>) {
    return client.patch<GuiaAbastecimento>(`${ENDPOINTS.operacao.guias}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.operacao.guias}${id}/`);
  },

  // ==========================================
  // MANIPULAÇÃO DE PDF
  // ==========================================
  obterPdfBlob(id: number) {
    // Retorna APENAS os dados binários
    return client.get<Blob>(`${ENDPOINTS.operacao.guias}${id}/pdf/`, {
      responseType: "blob"
    });
  }
};