import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { tiposAtividadeApi } from "../tiposAtividade.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/useAuth";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { TipoAtividadeReadDTO } from "../schemas/tipoAtividade.read.zod";
import { tipoAtividadeListSchema, tipoAtividadeViewSchema } from "../schemas/tipoAtividade.schema";

import "../../../../core/ui/layouts/ListPage.css";

export default function TipoAtividadeListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [tipos, setTipos] = useState<TipoAtividadeReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<TipoAtividadeReadDTO | null>(null);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchTipos = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await tiposAtividadeApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      // zodClient já trata o retorno na raiz
      setTipos(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar tipos de atividades no servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: TipoAtividadeReadDTO) {
    if (!item.id) return;
    try {
      await tiposAtividadeApi.deletar(item.id);
      setErrorMessage(null);
      fetchTipos({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir. Recomendamos apenas desativar o registro caso já esteja em uso."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Tipos de Atividade</h2>
          <p className="list-subtitle">Cadastre as funções e serviços realizados pelas equipes.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.operacao.tiposAtividade.create}>
              <span className="plus">+</span> Nova Atividade
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={tipos}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={tipoAtividadeListSchema}
        onParamsChange={fetchTipos}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.operacao.tiposAtividade.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(t) => !t.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<TipoAtividadeReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={tipoAtividadeViewSchema}
        onEdit={(item) => navigate(ROUTES.operacao.tiposAtividade.edit(item.id))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}