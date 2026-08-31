import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { secretariaApi } from "../secretarias.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/useAuth";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { SecretariaReadDTO } from "../schemas/secretaria.read.zod";
import { secretariaListSchema, secretariaViewSchema } from "../schemas/secretaria.schema";

import "../../../../core/ui/layouts/ListPage.css";

export default function SecretariaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [secretarias, setSecretarias] = useState<SecretariaReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<SecretariaReadDTO | null>(null);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchSecretarias = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await secretariaApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      setSecretarias(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar secretarias no servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: SecretariaReadDTO) {
    if (!item.id) return;
    try {
      await secretariaApi.deletar(item.id);
      setErrorMessage(null);
      fetchSecretarias({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir. É provável que esta secretaria possua veículos ou guias vinculadas. Desative-a em vez de excluir."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Secretarias e Lotações</h2>
          <p className="list-subtitle">Estrutura organizacional da prefeitura.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.organizacao.secretarias.create}>
              <span className="plus">+</span> Nova secretaria
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={secretarias}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={secretariaListSchema}
        onParamsChange={fetchSecretarias}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.organizacao.secretarias.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(s) => !s.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<SecretariaReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={secretariaViewSchema}
        onEdit={(item) => navigate(ROUTES.organizacao.secretarias.edit(item.id))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}