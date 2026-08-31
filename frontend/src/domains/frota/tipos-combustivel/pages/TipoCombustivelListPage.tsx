import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { tiposCombustivelApi } from "../tiposCombustivel.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/useAuth";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { TipoCombustivelReadDTO } from "../schemas/tipoCombustivel.read.zod";
import { tipoCombustivelListSchema, tipoCombustivelViewSchema } from "../schemas/tipoCombustivel.schema";

import "../../../../core/ui/layouts/ListPage.css";

export default function TipoCombustivelListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [tipos, setTipos] = useState<TipoCombustivelReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<TipoCombustivelReadDTO | null>(null);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchTipos = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await tiposCombustivelApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      setTipos(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar tipos de combustível no servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: TipoCombustivelReadDTO) {
    if (!item.id) return;
    try {
      await tiposCombustivelApi.deletar(item.id);
      setErrorMessage(null);
      fetchTipos({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir. É provável que este combustível já esteja vinculado a veículos ou guias de abastecimento. Desative-o em vez de excluir."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Tipos de Combustível</h2>
          <p className="list-subtitle">Gerencie os combustíveis aceitos na frota.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.frota.tiposCombustivel.create}>
              <span className="plus">+</span> Novo Combustível
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={tipos}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={tipoCombustivelListSchema}
        onParamsChange={fetchTipos}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.frota.tiposCombustivel.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(t) => !t.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<TipoCombustivelReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={tipoCombustivelViewSchema}
        onEdit={(item) => navigate(ROUTES.frota.tiposCombustivel.edit(item.id))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}