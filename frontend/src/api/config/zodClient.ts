import { z } from "zod"
import { client } from "./apiClient"
import type { PaginatedResponse } from "../../types/api"

// =====================================================
// SCHEMA PAGINADO (genérico)
// =====================================================
function createPaginatedSchema<T>(itemSchema: z.ZodType<T>) {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  })
}

// =====================================================
// GET (item único)
// =====================================================
export async function safeGet<T>(
  url: string,
  schema: z.ZodType<T>,
  params?: Record<string, unknown>
): Promise<T> {
  const response = await client.get(url, { params })
  return await schema.parseAsync(response.data)
}

// =====================================================
// GET PAGINADO
// =====================================================
export async function safeGetPaginated<T>(
  url: string,
  itemSchema: z.ZodType<T>,
  params?: Record<string, unknown>
): Promise<PaginatedResponse<T>> {
  const response = await client.get(url, { params })
  const schema = createPaginatedSchema(itemSchema)
  return await schema.parseAsync(response.data)
}

// =====================================================
// POST
// =====================================================
export async function safePost<TResponse, TRequest>(
  url: string,
  responseSchema: z.ZodType<TResponse>,
  requestSchema: z.ZodType<TRequest>,
  data: TRequest
): Promise<TResponse> {
  const payload = await requestSchema.parseAsync(data)
  const response = await client.post(url, payload)
  return await responseSchema.parseAsync(response.data)
}

// =====================================================
// PUT (substituição completa)
// =====================================================
export async function safePut<TResponse, TRequest>(
  url: string,
  responseSchema: z.ZodType<TResponse>,
  requestSchema: z.ZodType<TRequest>,
  data: TRequest
): Promise<TResponse> {
  const payload = await requestSchema.parseAsync(data)
  const response = await client.put(url, payload)
  return await responseSchema.parseAsync(response.data)
}

// =====================================================
// PATCH (parcial)
// =====================================================
export async function safePatch<TResponse, TRequest>(
  url: string,
  responseSchema: z.ZodType<TResponse>,
  requestSchema: z.ZodObject<any>,
  data: Partial<TRequest>
): Promise<TResponse> {
  const payload = await requestSchema.partial().parseAsync(data)
  const response = await client.patch(url, payload)
  return await responseSchema.parseAsync(response.data)
}

// =====================================================
// DELETE
// =====================================================
export async function safeDelete(url: string): Promise<void> {
  await client.delete(url)
}