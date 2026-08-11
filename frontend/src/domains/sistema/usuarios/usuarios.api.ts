import { createCrudApi } from "../../../core/api/crudFactory";
import { client } from "../../../core/api/apiClient";
import { ENDPOINTS } from "../../../core/api/endpoints";
import type { PaginatedResponse } from "../../../core/types/api";

import { usuarioReadSchema, type UsuarioReadDTO } from "./schemas/usuario.read.zod";
import { usuarioWriteSchema } from "./schemas/usuario.write.zod";
import type { UsuarioListParams } from "./schemas/usuario.filters.zod";

const baseCrud = createCrudApi<
  typeof usuarioReadSchema,
  typeof usuarioWriteSchema,
  UsuarioListParams
>({
  endpoint: ENDPOINTS.usuarios.base,
  readSchema: usuarioReadSchema,
  writeSchema: usuarioWriteSchema
});

// Estendemos o CRUD base com os endpoints específicos de usuários
export const usuarioApi = {
  ...baseCrud,

  // Perfil
  me() {
    return client.get<UsuarioReadDTO>(ENDPOINTS.usuarios.me);
  },
  atualizarMe(data: any) {
    return client.patch<UsuarioReadDTO>(ENDPOINTS.usuarios.me, data);
  },

  // Permissões
  listarPermissoes(params?: UsuarioListParams) {
    return client.get<PaginatedResponse<UsuarioReadDTO>>(`${ENDPOINTS.usuarios.base}permissions/`, { params });
  },
  atualizarPermissoes(id: number, data: Partial<UsuarioReadDTO>) {
    return client.patch<UsuarioReadDTO>(`${ENDPOINTS.usuarios.base}${id}/permissions/`, data);
  },
};