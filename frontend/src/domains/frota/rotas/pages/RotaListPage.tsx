import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { rotasApi } from "../rotas.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/AuthContext";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { RotaReadDTO } from "../schemas/rota.read.zod";
import { rotaListSchema, rotaViewSchema } from "../schemas/rota.schema";

import "../../../../core/ui/layouts/ListPage.css";

export default function RotaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [rotas, setRotas] = useState<RotaReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<RotaReadDTO | null>(null);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchRotas = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await rotasApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      setRotas(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar rotas de transporte no servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: RotaReadDTO) {
    if (!item.id) return;
    try {
      await rotasApi.deletar(item.id);
      setErrorMessage(null);
      fetchRotas({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir rota. Desative-a caso possua vínculos históricos."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Rotas de Transporte</h2>
          <p className="list-subtitle">Gerencie os percursos padrão cadastrados por secretaria.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.frota.rotas.create}>
              <span className="plus">+</span> Nova rota
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={rotas}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={rotaListSchema}
        onParamsChange={fetchRotas}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.frota.rotas.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(r) => !r.ativa ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<RotaReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={rotaViewSchema}
        onEdit={(item) => navigate(ROUTES.frota.rotas.edit(item.id))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}