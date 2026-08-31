import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { instituicoesApi } from "../instituicoes.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/useAuth";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { InstituicaoReadDTO } from "../schemas/instituicao.read.zod";
import { instituicaoListSchema, instituicaoViewSchema } from "../schemas/instituicao.schema";

import "../../../../core/ui/layouts/ListPage.css";

export default function InstituicaoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [instituicoes, setInstituicoes] = useState<InstituicaoReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<InstituicaoReadDTO | null>(null);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchInstituicoes = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await instituicoesApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      setInstituicoes(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar instituições no servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: InstituicaoReadDTO) {
    if (!item.id) return;
    try {
      await instituicoesApi.deletar(item.id);
      setErrorMessage(null);
      fetchInstituicoes({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir. É provável que existam rotas ou guias vinculadas. Recomendamos apenas desativar o registro."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Instituições e Locais</h2>
          <p className="list-subtitle">Cadastro de escolas, creches, unidades de saúde e prédios públicos.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.organizacao.instituicoes.create}>
              <span className="plus">+</span> Nova Instituição
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={instituicoes}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={instituicaoListSchema}
        onParamsChange={fetchInstituicoes}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.organizacao.instituicoes.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(i) => !i.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<InstituicaoReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={instituicaoViewSchema}
        onEdit={(item) => navigate(ROUTES.organizacao.instituicoes.edit(item.id))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}