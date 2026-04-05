import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { guiasApi } from "../../../api/operacao/guiasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { GuiaAbastecimento } from "../../../types/models";
import { guiaAbastecimentoListSchema } from "../../../schemas/guiaAbastecimento.schema";

import "../../../assets/css/ListPage.css";

export default function GuiaAbastecimentoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Estados da Listagem e Paginação
  const [guiasAbastecimento, setGuiasAbastecimento] = useState<GuiaAbastecimento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissões calculadas para as ações da linha (DataTable)
  const canEdit = Boolean(me?.is_staff || me?.can_edit_guia_abastecimento);
  const canDelete = Boolean(me?.is_staff || me?.can_delete_guia_abastecimento);

  // Motor de busca paginado
  const fetchGuias = useCallback(async (params: DataTableParams) => {
    // Se o usuário ainda estiver digitando na barra de pesquisa, zera o cronômetro
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Espera 500ms de inatividade antes de bater no banco de dados do Django
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

  // Tratamento de Exclusão Paginada
  async function handleDelete(item: GuiaAbastecimento) {
    if (!item.id) return;
    
    try {
      await guiasApi.deletar(item.id);
      setErrorMessage(null);
      // Força recarregamento retornando à primeira página
      fetchGuias({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir guia de abastecimento."));
    }
  }

  // Tratamento de PDF Otimizado
  async function handlePdf(item: GuiaAbastecimento) {
    if (!item.id) {
      setErrorMessage("Não foi possível gerar o PDF: guia sem ID válido.");
      return;
    }

    setErrorMessage(null);

    try {
      await guiasApi.abrirPdfEmNovaAba(item.id);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Não foi possível gerar o PDF agora. Tente novamente."));
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

      {errorMessage && (
        <div className="error-message-box" style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "1rem" }}>
          {errorMessage}
        </div>
      )}

      <DataTable
        data={guiasAbastecimento}
        total={total}
        loading={loading}
        schema={guiaAbastecimentoListSchema}
        onParamsChange={fetchGuias}
        onPdf={handlePdf}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(item) => navigate(ROUTES.operacao.guias.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}