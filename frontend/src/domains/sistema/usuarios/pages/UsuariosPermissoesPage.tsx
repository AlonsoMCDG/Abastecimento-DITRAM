import { useState, useCallback } from "react";
import { usuarioApi } from "../usuarios.api";
import type { UsuarioReadDTO } from "../schemas/usuario.read.zod";
import { useAuth } from "../../../../core/auth/AuthContext";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import type { TableSchema } from "../../../../core/types/form";

import "../../assets/css/ListPage.css";
import "../../assets/css/DataTable.css";

type EditedMap = Record<number, Partial<UsuarioReadDTO>>;
type PermissionKey =
  | "is_staff"
  | "can_write_cadastros"
  | "can_write_frota"
  | "can_create_guia_abastecimento"
  | "can_edit_guia_abastecimento"
  | "can_delete_guia_abastecimento";

export default function UsuariosPermissoesPage() {
  const { user: me } = useAuth();

  const [users, setUsers] = useState<UsuarioReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [edited, setEdited] = useState<EditedMap>({});

  const canEditAdmins = Boolean(me?.is_superuser);

  const canEditUser = (u: UsuarioReadDTO) => {
    if (u.is_superuser) return false;
    if (u.is_staff && !canEditAdmins) return false;
    return true;
  };

  const fetchPermissions = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const listRes = await usuarioApi.listarPermissoes({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering ?? undefined,
      });
      setUsers(listRes.data.results || []);
      setTotal(listRes.data.count || 0);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Falha ao carregar permissões.");
    } finally {
      setLoading(false);
    }
  }, []);

  const toggle = (id: number, field: PermissionKey) => {
    setEdited((prev) => {
      const current = prev[id] || {};
      const base = users.find((u) => u.id === id);
      const baseValue = base?.[field] as boolean | undefined;
      const currentValue = (current[field] ?? baseValue) as boolean | undefined;
      return { ...prev, [id]: { ...current, [field]: !currentValue } };
    });
  };

  const save = async (u: UsuarioReadDTO) => {
    if (!u.id) return;
    const patch = edited[u.id];
    if (!patch || Object.keys(patch).length === 0) return;

    try {
      await usuarioApi.atualizarPermissoes(u.id, patch);
      setEdited((prev) => {
        const next = { ...prev };
        delete next[u.id as number];
        return next;
      });
      // Recarrega os dados com os parâmetros atuais (força refresh via nova referência, 
      // ou o usuário clica num botão de refresh. Aqui, remover a edição já limpa o estado visual).
    } catch (err) {
      setErrorMsg("Erro ao salvar permissões. Tente novamente.");
    }
  };

  // Helper para renderizar os checkboxes centralizados e com a lógica amarrada
  const renderCheckbox = (u: UsuarioReadDTO, field: PermissionKey, superOnly = false) => {
    const patch = u.id ? edited[u.id] : undefined;
    const isChecked = Boolean((patch?.[field] ?? u[field]) as boolean | undefined);
    const disabled = !canEditUser(u) || (superOnly && !canEditAdmins);

    return (
      <div className="text-center">
        <input
          type="checkbox"
          className="dt-checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={() => u.id && toggle(u.id, field)}
        />
      </div>
    );
  };

  // Esquema Dinâmico da Tabela (Fica dentro do componente para enxergar as funções locais de toggle/save)
  const permissionSchema: TableSchema = {
    columns: [
      { key: "cpf", label: "CPF", sortKey: "cpf" },
      {
        key: "first_name",
        label: "Nome Completo",
        sortKey: "first_name",
        format: (_, u: UsuarioReadDTO) => `${u.first_name || ""} ${u.last_name || ""}`.trim()
      },
      { key: "is_staff", label: "👑 Admin", sortable: false, format: (_, u: UsuarioReadDTO) => renderCheckbox(u, "is_staff", true) },
      { key: "can_write_cadastros", label: "📝 Cadastros", sortable: false, format: (_, u: UsuarioReadDTO) => renderCheckbox(u, "can_write_cadastros") },
      { key: "can_write_frota", label: "🚗 Frota", sortable: false, format: (_, u: UsuarioReadDTO) => renderCheckbox(u, "can_write_frota") },
      { key: "can_create_guia_abastecimento", label: "⛽ Criar Guia", sortable: false, format: (_, u: UsuarioReadDTO) => renderCheckbox(u, "can_create_guia_abastecimento") },
      { key: "can_edit_guia_abastecimento", label: "✏️ Editar Guia", sortable: false, format: (_, u: UsuarioReadDTO) => renderCheckbox(u, "can_edit_guia_abastecimento") },
      { key: "can_delete_guia_abastecimento", label: "🗑️ Excluir Guia", sortable: false, format: (_, u: UsuarioReadDTO) => renderCheckbox(u, "can_delete_guia_abastecimento") },
      {
        key: "custom_actions", // Nossa coluna customizada de ação que substitui a nativa
        label: "Ação",
        sortable: false,
        format: (_, u: UsuarioReadDTO) => {
          const patch = u.id ? edited[u.id] : undefined;
          const dirty = Boolean(patch && Object.keys(patch).length > 0);
          
          if (u.is_superuser) {
            return <span className="dt-badge dt-badge-superadmin">Superadmin</span>;
          }
          return (
            <button
              className={`dt-btn-save ${dirty ? "is-dirty" : ""}`}
              disabled={!canEditUser(u) || !dirty}
              onClick={() => save(u)}
            >
              Salvar
            </button>
          );
        }
      }
    ]
  };

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Matriz de Permissões</h2>
          <p className="list-subtitle">Controle granular de acesso aos módulos do sistema.</p>
        </div>
      </div>

      <DataTable
        data={users}
        total={total}
        loading={loading}
        error={errorMsg}
        schema={permissionSchema}
        onParamsChange={fetchPermissions}
        // Desativamos as ações nativas do DataTable para usar a nossa coluna custom_actions!
        canEdit={false} 
        canDelete={false}
        // Colore a linha de verde caso haja edições não salvas
        rowClassName={(u) => u.id && edited[u.id] && Object.keys(edited[u.id]).length > 0 ? "dt-row-dirty" : ""}
      />

      <p className="info-message-box">
        <strong>ℹ️ Regras de Hierarquia:</strong> Apenas o Superadmin pode promover usuários para Admin (Staff) e alterar permissões de usuários que já são Admins. Administradores normais só podem gerenciar acessos de usuários comuns.
      </p>
    </div>
  );
}