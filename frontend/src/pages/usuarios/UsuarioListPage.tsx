import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../components/DataTable";
import { usuarioApi } from "../../api/usuarios/usuariosApi";
import { ROUTES } from "../../routes/routes";
import { useAuth } from "../../auth/AuthContext";
import { Can } from "../../components/auth/Can";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

import type { Usuario } from "../../types/models";
import { usuarioFormSchema } from "../../schemas/usuario.schema";

import "../../assets/css/ListPage.css";

export default function UsuarioListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Estados da Listagem e Paginação
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Controle de atraso para não sobrecarregar a API durante a busca
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissão estrita: Apenas administradores (staff) gerenciam usuários
  const isAdmin = Boolean(me?.is_staff);

  // Motor de busca paginado
  const fetchUsuarios = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await usuarioApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        setUsuarios(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Exclusão segura com atualização em tempo real
  async function handleDelete(item: Usuario) {
    if (!item.id) return;

    try {
      await usuarioApi.deletar(item.id);
      
      // Retorna para a página 1 após excluir, atualizando a tabela suavemente
      fetchUsuarios({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Falha ao excluir usuário. Verifique dependências."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Usuários</h2>
          <p className="list-subtitle">Cadastro e manutenção de usuários do sistema.</p>
        </div>

        <div className="list-actions">
          <Can action="is_staff">
            <Link className="list-create" to={ROUTES.sistema.usuarios.create}>
              <span className="plus">+</span> Novo usuário
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={usuarios}
        total={total}
        loading={loading}
        schema={usuarioFormSchema}
        onParamsChange={fetchUsuarios}
        canEdit={isAdmin}
        canDelete={isAdmin}
        onEdit={(item) => navigate(ROUTES.sistema.usuarios.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}