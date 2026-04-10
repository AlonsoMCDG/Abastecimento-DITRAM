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
  // MANIPULAÇÃO DE PDF (Segura com Auth Tokens)
  // ==========================================

  baixarPdf(id: number) {
    // Retorna o binário usando a instância do Axios (garante que o JWT Token vá no Header)
    return client.get<Blob>(`${ENDPOINTS.operacao.guias}${id}/pdf/`, {
      responseType: "blob"
    });
  },

  async abrirPdfEmNovaAba(id: number) {
    const response = await this.baixarPdf(id);
    
    // Cria um arquivo temporário na memória do navegador
    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    try {
      const openedWindow = window.open(url, "_blank");

      // Fallback: Se o navegador bloquear o popup, força o download do arquivo
      if (!openedWindow) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `guia_abastecimento_${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      // Limpa a memória após 1 segundo para não travar o navegador do usuário
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  },

  async imprimirPdfDireto(id: number) {
    try {
      // 1. Faz o request autenticado via Axios (O Token JWT vai no Header)
      const response = await this.baixarPdf(id);
      
      // 2. Cria um arquivo na memória do navegador
      const blob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(blob);

      // 3. Cria um iframe invisível para injetar o PDF
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = blobUrl;
      
      document.body.appendChild(iframe);

      // 4. Assim que o PDF carregar no iframe, abre a janela de impressão
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 100); // Um pequeno delay garante que o renderizador do navegador montou o PDF
      };

      // 5. Limpa a memória e o HTML após fechar a janela de impressão
      // (Alguns navegadores pausam o JS durante o print, então um timeout longo é seguro)
      setTimeout(() => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(blobUrl);
      }, 60000); // 1 minuto de limpeza

    } catch (error) {
      console.error("Erro ao preparar PDF para impressão:", error);
      alert("Não foi possível gerar o PDF para impressão. Verifique sua conexão.");
    }
  }
};