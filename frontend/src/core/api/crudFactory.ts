import { z } from "zod"
import {
  safeGet,
  safeGetPaginated,
  safePost,
  safePatch,
  safePut,
  safeDelete
} from "./zodClient"

import type { PaginatedResponse } from "../types/api"

export function createCrudApi<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TReadSchema extends z.ZodType<any>,
  TWriteSchema extends z.ZodObject<z.ZodRawShape>,
  TParams extends Record<string, unknown> = Record<string, unknown>
>(config: {
  endpoint: string
  readSchema: TReadSchema
  writeSchema: TWriteSchema
}) {

  type TRead = z.infer<TReadSchema>
  type TWrite = z.infer<TWriteSchema>

  const { readSchema, writeSchema } = config

  // Garante que a URL sempre termine com barra (Exigência do DRF)
  const baseEndpoint = config.endpoint.replace(/\/?$/, "/")

  return {
    listar(params?: TParams): Promise<PaginatedResponse<TRead>> {
      return safeGetPaginated(baseEndpoint, readSchema, params)
    },

    buscar(id: number): Promise<TRead> {
      return safeGet(`${baseEndpoint}${id}/`, readSchema)
    },

    criar(data: TWrite): Promise<TRead> {
      return safePost(baseEndpoint, readSchema, writeSchema, data)
    },

    atualizar(id: number, data: Partial<TWrite>): Promise<TRead> {
      return safePatch(`${baseEndpoint}${id}/`, readSchema, writeSchema, data)
    },

    substituir(id: number, data: TWrite): Promise<TRead> {
      return safePut(`${baseEndpoint}${id}/`, readSchema, writeSchema, data)
    },

    deletar(id: number): Promise<void> {
      return safeDelete(`${baseEndpoint}${id}/`)
    }
  }
}
