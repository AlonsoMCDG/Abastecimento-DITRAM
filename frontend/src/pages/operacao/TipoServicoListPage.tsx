import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../components/DataTable";
import { tiposServicoApi } from "../../api/operacao/tiposServicoApi";
import { ROUTES } from "../../routes/routes";
import { useAuth } from "../../auth/AuthContext";
import { Can } from "../../components/auth/Can";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

import type { TipoServico } from "../../types/models";
import { tipoServicoListSchema, tipoServicoViewSchema } from "../../schemas/tipoServico.schema";

import "../../assets/css/ListPage.css";
import { QuickViewModal } from "../../components/QuickViewModal";

export default function TipoServicoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [tipos, setTipos] = useState<TipoServico[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<TipoServico | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchTipos = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await tiposServicoApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        setTipos(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar tipos de serviços no servidor.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: TipoServico) {
    if (!item.id) return;
    try {
      await tiposServicoApi.deletar(item.id);
      setErrorMessage(null);
      fetchTipos({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir. É provável que existam funcionários atrelados a esta função. Recomendamos apenas desativar o registro."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Tipos de Serviço</h2>
          <p className="list-subtitle">Cadastre as funções e serviços realizados pelas equipes da prefeitura.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.operacao.tiposServico.create}>
              <span className="plus">+</span> Novo Serviço
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={tipos}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={tipoServicoListSchema}
        onParamsChange={fetchTipos}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.operacao.tiposServico.edit(item.id!))}
        onDelete={handleDelete}
        rowClassName={(t) => !t.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<TipoServico>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={tipoServicoViewSchema}
        onEdit={(item) => navigate(ROUTES.operacao.tiposServico.edit(item.id!))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}