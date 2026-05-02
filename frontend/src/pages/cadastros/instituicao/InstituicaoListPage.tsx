import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { instituicoesApi } from "../../../api/organizacao/instituicoesApi"; // Ajuste se o caminho for diferente
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Instituicao } from "../../../types/models";
import { instituicaoListSchema, instituicaoViewSchema } from "../../../schemas/organizacao/instituicao.schema";

import "../../../assets/css/ListPage.css";
import { QuickViewModal } from "../../../components/QuickViewModal";

export default function InstituicaoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewitem] = useState<Instituicao | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchInstituicoes = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await instituicoesApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        setInstituicoes(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar instituições no servidor.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: Instituicao) {
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
        onView={(item) => setViewitem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.organizacao.instituicoes.edit(item.id!))}
        onDelete={handleDelete}
        rowClassName={(i) => !i.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<Instituicao>
        isOpen={!!viewItem}
        onClose={() => setViewitem(null)}
        data={viewItem}
        schema={instituicaoViewSchema}
        onEdit={(item) => navigate(ROUTES.organizacao.instituicoes.edit(item.id!))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}