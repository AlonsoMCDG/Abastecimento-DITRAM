import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../components/DataTable";
import { alocacoesApi } from "../../api/operacao/alocacoesApi";
import { ROUTES } from "../../routes/routes";
import { useAuth } from "../../auth/AuthContext";
import { Can } from "../../components/auth/Can";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

import type { AlocacaoServico } from "../../types/models";
import { alocacaoListSchema, alocacaoViewSchema } from "../../schemas/alocacao.schema";

import "../../assets/css/ListPage.css";
import { QuickViewModal } from "../../components/QuickViewModal";

export default function AlocacaoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [alocacoes, setAlocacoes] = useState<AlocacaoServico[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<AlocacaoServico| null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchAlocacoes = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await alocacoesApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        setAlocacoes(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar alocações no servidor.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: AlocacaoServico) {
    if (!item.id) return;
    try {
      await alocacoesApi.deletar(item.id);
      setErrorMessage(null);
      fetchAlocacoes({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir alocação de serviço."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Alocações de Serviço</h2>
          <p className="list-subtitle">Vínculo de funcionários com suas respectivas funções e secretarias.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.operacao.alocacoesServico.create}>
              <span className="plus">+</span> Nova alocação
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={alocacoes}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={alocacaoListSchema}
        onParamsChange={fetchAlocacoes}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.operacao.alocacoesServico.edit(item.id!))}
        onDelete={handleDelete}
        // Exemplo visual: Destaca levemente a linha se for o serviço principal
        rowClassName={(item) => item.is_principal ? "dt-row-highlight" : ""} 
      />

      <QuickViewModal<AlocacaoServico>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={alocacaoViewSchema}
        onEdit={(item) => navigate(ROUTES.operacao.alocacoesServico.edit(item.id!))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}