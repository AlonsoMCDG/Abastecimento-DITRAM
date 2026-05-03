import { client } from "../../../core/api/apiClient"
import { ENDPOINTS } from "../../../core/api/endpoints"
import type { Usuario } from "../../../core/types/models"
import type { PaginatedResponse } from "../../../core/types/api";

// Filtros para listagem de usuários
interface UsuarioListParams {
  is_staff?: boolean;
  search?: string;
  ordering?: string | null;
  page?: number;
  page_size?: number;
}

// Isolamento de Payloads (Segurança Tipada)
type UsuarioCreatePayload = Omit<Usuario, "id">;

type UsuarioRegisterPayload = Pick<Usuario, "cpf" | "password" | "first_name" | "last_name" | "email">;

type UsuarioMeUpdatePayload = Partial<UsuarioRegisterPayload>;

// EXTRAÍMOS AS PERMISSÕES: Apenas esses campos podem ser enviados no endpoint de permissões
type PermissoesPayload = Pick<Usuario, 
  | "is_staff" 
  | "is_superuser" 
  | "can_write_cadastros" 
  | "can_write_frota" 
  | "can_create_guia_abastecimento" 
  | "can_edit_guia_abastecimento" 
  | "can_delete_guia_abastecimento"
>;

export const usuarioApi = {

  listar(params?: UsuarioListParams) {
    return client.get<PaginatedResponse<Usuario>>(ENDPOINTS.usuarios.base, { params });
  },
  
  buscar(id: number) {
    return client.get<Usuario>(`${ENDPOINTS.usuarios.base}${id}/`);
  },

  criar(data: UsuarioCreatePayload) {
    return client.post<Usuario>(ENDPOINTS.usuarios.base, data);
  },

  atualizar(id: number, data: Partial<UsuarioCreatePayload>) {
    return client.patch<Usuario>(`${ENDPOINTS.usuarios.base}${id}/`, data);
  },

  deletar(id: number) {
    return client.delete(`${ENDPOINTS.usuarios.base}${id}/`);
  },

  // ==========================================
  // PERFIL DO USUÁRIO LOGADO
  // ==========================================

  me() {
    return client.get<Usuario>(ENDPOINTS.usuarios.me);
  },

  atualizarMe(data: UsuarioMeUpdatePayload) {
    return client.patch<Usuario>(ENDPOINTS.usuarios.me, data);
  },

  // ==========================================
  // CONTROLE DE ACESSO E PERMISSÕES
  // ==========================================
  
  listarPermissoes(params?: UsuarioListParams) {
    return client.get<PaginatedResponse<Usuario>>(`${ENDPOINTS.usuarios.base}permissions/`, { params });
  },

  atualizarPermissoes(id: number, data: Partial<PermissoesPayload>) {
    // Usando o Partial<PermissoesPayload> garantimos que NENHUM dado como 
    // cpf ou password será enviado sem querer nesta requisição.
    return client.patch<Usuario>(`${ENDPOINTS.usuarios.base}${id}/permissions/`, data);
  },

  registrar(data: UsuarioRegisterPayload) {
    return client.post<Usuario>(ENDPOINTS.usuarios.register, data);
  }

}
