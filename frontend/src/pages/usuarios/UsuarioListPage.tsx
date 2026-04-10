import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, {type DataTableParams } from "../../components/DataTable";

import { usuarioApi } from "../../api/usuarios/usuariosApi";

import { ROUTES } from "../../routes/routes";
import { useAuth } from "../../auth/AuthContext";
import { Can } from "../../components/auth/Can";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

import type { Usuario } from "../../types/models";
import { usuarioListSchema } from "../../schemas/usuario.schema"; // Importando o schema correto!

import "../../assets/css/ListPage.css"

export default function UsuarioListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAdmin = Boolean(me?.is_staff);

  // Limpa o timer se o componente for desmontado (Prevenção de Memory Leak)
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const fetchUsuarios = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
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
        setErrorMessage("Erro ao buscar usuários do sistema.");
        console.error("Erro ao buscar usuários:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: Usuario) {
    if (!item.id) return;
    try {
      await usuarioApi.deletar(item.id);
      setErrorMessage(null);
      fetchUsuarios({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir usuário. Verifique dependências."));
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

      {/* O erro agora é passado elegantemente para o DataTable */}
      <DataTable
        data={usuarios}
        total={total}
        loading={loading}
        error={errorMessage} 
        schema={usuarioListSchema} 
        onParamsChange={fetchUsuarios}
        canEdit={isAdmin}
        canDelete={isAdmin}
        onEdit={(item) => navigate(ROUTES.sistema.usuarios.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}