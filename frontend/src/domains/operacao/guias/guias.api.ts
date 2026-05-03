import { createCrudApi } from "../../../core/api/crudFactory"
import { client } from "../../../core/api/apiClient"

import { 
  safeGet, 
  safeGetPaginated, 
  safePost, 
  safePatch, 
  safeDelete 
} from "../../../core/api/zodClient"
import { ENDPOINTS } from "../../../core/api/endpoints";
import type { PaginatedResponse } from "../../../core/types/api";

import {
  guiaAbastecimentoReadSchema, type GuiaAbastecimentoReadDTO
} from "./schemas/guia.read.zod"

import {
  guiaAbastecimentoWriteSchema, type GuiaAbastecimentoWriteDTO
} from "./schemas/guia.write.zod"

// ==========================================
// PARÂMETROS DE BUSCA
// ==========================================
export type GuiaListParams = {
  pessoa?: number
  veiculo?: number
  secretaria?: number
  rota?: number
  tipo_atividade?: number
  instituicao?: number
  tipo_veiculo?: string
  tipo_combustivel?: number
  usuario?: number

  search?: string
  ordering?: string
  page?: number
  page_size?: number
}

export const guiasApi = {

  // ==========================================
  // LISTAR (PAGINADO)
  // ==========================================
  async listar(params?: GuiaListParams): Promise<PaginatedResponse<GuiaAbastecimentoReadDTO>> {
    return safeGetPaginated(
      ENDPOINTS.operacao.guias, 
      guiaAbastecimentoReadSchema, 
      params
    )
  },

  // ==========================================
  // BUSCAR POR ID
  // ==========================================
  async buscar(id: number): Promise<GuiaAbastecimentoReadDTO> {
    return safeGet(
      `${ENDPOINTS.operacao.guias}${id}/`, 
      guiaAbastecimentoReadSchema
    )
  },

  // ==========================================
  // CRIAR
  // ==========================================
  async criar(data: GuiaAbastecimentoWriteDTO): Promise<GuiaAbastecimentoReadDTO> {
    return safePost(
      ENDPOINTS.operacao.guias,
      guiaAbastecimentoReadSchema,
      guiaAbastecimentoWriteSchema,
      data
    )
  },

  // ==========================================
  // ATUALIZAR (PATCH)
  // ==========================================
  async atualizar(
    id: number,
    data: Partial<GuiaAbastecimentoWriteDTO>
  ): Promise<GuiaAbastecimentoReadDTO> {
    return safePatch(
      `${ENDPOINTS.operacao.guias}${id}/`,
      guiaAbastecimentoReadSchema,
      guiaAbastecimentoWriteSchema,
      data
    )
  },

  // ==========================================
  // DELETAR
  // ==========================================
  async deletar(id: number): Promise<void> {
    return safeDelete(`${ENDPOINTS.operacao.guias}${id}/`)
  },

  // ==========================================
  // PDF
  // ==========================================
  async obterPdfBlob(id: number): Promise<Blob> {
    const response = await client.get<Blob>(
      `${ENDPOINTS.operacao.guias}${id}/pdf/`,
      { responseType: "blob" }
    )

    return response.data
  }
};

const baseCrud = createCrudApi<
  GuiaAbastecimentoReadDTO,
  GuiaAbastecimentoWriteDTO
>(
  ENDPOINTS.operacao.guias,
  guiaAbastecimentoReadSchema,
  guiaAbastecimentoWriteSchema
)

export const guiasApi2 = {
  ...baseCrud,

  // ==========================================
  async obterPdfBlob(id: number): Promise<Blob> {
    const response = await client.get(
      `${ENDPOINTS.operacao.guias}${id}/pdf/`,
      { responseType: "blob" }
    )

    return response.data
  }
}