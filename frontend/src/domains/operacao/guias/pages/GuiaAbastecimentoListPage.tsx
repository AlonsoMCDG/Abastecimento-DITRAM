import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { guiasApi } from "../api/guias.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/AuthContext";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";
import { processPdfBlob } from "../../../../core/utils/pdfHandler";

import type { GuiaAbastecimentoReadDTO } from "../schemas/guia.dto";
import { guiaAbastecimentoListSchema, guiaViewSchema } from "../schemas/guia.ui";

import "../../../../core/ui/layouts/ListPage.css";


export default function GuiaAbastecimentoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [guiasAbastecimento, setGuiasAbastecimento] = useState<GuiaAbastecimentoReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<GuiaAbastecimentoReadDTO | null>(null);

  const canEdit = Boolean(me?.is_staff || me?.can_edit_guia_abastecimento);
  const canDelete = Boolean(me?.is_staff || me?.can_delete_guia_abastecimento);

  const fetchGuias = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await guiasApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined, 
      });

      // O zodClient já entrega a raiz dos dados
      setGuiasAbastecimento(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar guias de abastecimento.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: GuiaAbastecimentoReadDTO) {
    if (!item.id) return;
    try {
      await guiasApi.deletar(item.id);
      setErrorMessage(null);
      // Recarrega os dados voltando para a primeira página
      fetchGuias({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir guia de abastecimento."));
    }
  }

  async function handlePdfAction(id: number, action: 'open' | 'print') {
    setErrorMessage(null);
    try {
      // A nova API já retorna o Blob diretamente
      const pdfBlob = await guiasApi.obterPdfBlob(id);

      await processPdfBlob(
        pdfBlob, 
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
        onPdf={(item, action) => handlePdfAction(item.id, action)}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(item) => navigate(ROUTES.operacao.guias.edit(item.id))}
        onDelete={handleDelete}
      />

      <QuickViewModal<GuiaAbastecimentoReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={guiaViewSchema}
        onEdit={(item) => navigate(ROUTES.operacao.guias.edit(item.id))}
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