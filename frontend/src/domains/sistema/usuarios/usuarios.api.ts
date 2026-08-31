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

  // Cadastro de novo usuário (tela de registro pública).
  //
  // IMPORTANTE: usa o endpoint PÚBLICO /register/ (AllowAny no backend).
  // O ViewSet base (POST /usuarios/) exige IsAdminUser e retorna 401
  // para usuários anônimos, o que quebrava o cadastro pela tela.
  //
  // Resposta do backend (UsuarioRegisterSerializer): { id, cpf, nome }
  // — diferente do UsuarioReadDTO retornado pelo ViewSet.
  registrar(data: Parameters<typeof baseCrud.criar>[0]) {
    return client.post<{ id: number; cpf: string; nome: string }>(
      ENDPOINTS.usuarios.register,
      data
    );
  },

  // Perfil
  me() {
    return client.get<UsuarioReadDTO>(ENDPOINTS.usuarios.me);
  },
  atualizarMe(data: Record<string, unknown>) {
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