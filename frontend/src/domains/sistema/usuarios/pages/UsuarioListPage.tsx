import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { usuarioApi } from "../usuarios.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/AuthContext";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { UsuarioReadDTO } from "../schemas/usuario.read.zod";
import { usuarioListSchema, usuarioViewSchema } from "../schemas/usuario.schema";

import "../../../../core/ui/layouts/ListPage.css";

export default function UsuarioListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<UsuarioReadDTO | null>(null);

  const isAdmin = Boolean(me?.is_staff);

  const fetchUsuarios = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await usuarioApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      setUsuarios(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar usuários do sistema.");
      console.error("Erro ao buscar usuários:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: UsuarioReadDTO) {
    if (!item.id) return;
    try {
      await usuarioApi.deletar(item.id);
      setErrorMessage(null);
      fetchUsuarios({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir usuário. Verifique se ele possui guias vinculadas."));
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
        error={errorMessage} 
        schema={usuarioListSchema} 
        onParamsChange={fetchUsuarios}
        onView={(item) => setViewItem(item)}
        canEdit={isAdmin}
        canDelete={isAdmin}
        onEdit={(item) => navigate(ROUTES.sistema.usuarios.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(u) => !u.is_active ? "dt-row-inactive" : ""}
      />
      
      <QuickViewModal<UsuarioReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={usuarioViewSchema}
        onEdit={(item) => navigate(ROUTES.sistema.usuarios.edit(item.id))}
        canEdit={isAdmin}
      />
    </div>
  );
}