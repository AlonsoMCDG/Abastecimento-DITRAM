import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { guiasApi } from "../../../api/operacao/guiasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { GuiaAbastecimento } from "../../../types/models";
import { guiaAbastecimentoListSchema, guiaViewSchema } from "../../../schemas/guiaAbastecimento.schema";

import "../../../assets/css/ListPage.css";
import { QuickViewModal } from "../../../components/QuickViewModal";
import { processPdfBlob } from "../../../utils/pdfHandler";


export default function GuiaAbastecimentoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [guiasAbastecimento, setGuiasAbastecimento] = useState<GuiaAbastecimento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<GuiaAbastecimento | null>(null);
  
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpa o timer se o componente for desmontado (Prevenção de Memory Leak)
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const canEdit = Boolean(me?.is_staff || me?.can_edit_guia_abastecimento);
  const canDelete = Boolean(me?.is_staff || me?.can_delete_guia_abastecimento);

  const fetchGuias = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await guiasApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering, 
        });

        setGuiasAbastecimento(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar guias de abastecimento.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: GuiaAbastecimento) {
    if (!item.id) return;
    try {
      await guiasApi.deletar(item.id);
      setErrorMessage(null);
      fetchGuias({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir guia de abastecimento."));
    }
  }

  async function handlePdfAction(id: number, action: 'open' | 'print') {
    setErrorMessage(null);
    try {
      const response = await guiasApi.obterPdfBlob(id);

      await processPdfBlob(
        response.data, 
        `Guia_Abastecimento_${id}.pdf`, 
        action
      );

    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Erro ao processar PDF."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Guias de abastecimento</h2>
          <p className="list-subtitle">Listagem e exportação em PDF.</p>
        </div>

        <div className="list-actions">
          <Can action="can_create_guia_abastecimento">
            <Link className="list-create" to={ROUTES.operacao.guias.create}>
              <span className="plus">+</span> Nova guia
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={guiasAbastecimento}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={guiaAbastecimentoListSchema}
        onParamsChange={fetchGuias}
        onView={(item) => setViewItem(item)}
        onPdf={(item, action) => handlePdfAction(item.id!, action)}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(item) => navigate(ROUTES.operacao.guias.edit(item.id!))}
        onDelete={handleDelete}
      />

      <QuickViewModal<GuiaAbastecimento>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={guiaViewSchema}
        onEdit={(item) => navigate(ROUTES.operacao.guias.edit(item.id!))}
        canEdit={canEdit}
        footerActions={(item) => (
          <button 
            className="dt-btn pdf dt-btn-text" 
            onClick={() => handlePdfAction(item.id, 'print')}
            >
            🖨️ Gerar PDF para Impressão
          </button>
        )}
      />
    </div>
  );
}