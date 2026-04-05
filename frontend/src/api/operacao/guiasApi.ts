import { client } from "../config/apiClient"
import { ENDPOINTS } from "../config/endpoints";
import type { GuiaAbastecimento } from "../../types/models"
import type { PaginatedResponse } from "../../types/api";


// Filtros para a tela de listagem e relatórios
interface GuiaListParams {
  data_emissao?: string;
  pessoa_id?: number;    // Substitui o antigo 'condutor'
  veiculo_id?: number;
  secretaria_id?: number;
  tipo_combustivel?: string;
  search?: string; 
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// Payload de Escrita: Removido o ID e os campos extras de leitura 
// que são gerados pelo backend na hora do GET.
type GuiaCreatePayload = Omit<
  GuiaAbastecimento,
  "id" | "pessoa_nome" | "veiculo_placa" | "tipo_servico_nome" | "usuario_nome"
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

  baixarPdf(id: number) {
    return client.get<Blob>(`${ENDPOINTS.operacao.guias}${id}/pdf/`, {
      responseType: "blob"
    });
  },

  async abrirPdfEmNovaAba(id: number) {
    const response = await this.baixarPdf(id);
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    try {
      const openedWindow = window.open(url, "_blank");

      // Fallback seguro caso haja bloqueador de popups
      if (!openedWindow) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `guia_abastecimento_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  },

  urlPdf(id: number): string {
    return `${client.defaults.baseURL}${ENDPOINTS.operacao.guias}${id}/pdf/`;
  }

}