import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { secretariaApi } from "../../../api/organizacao/secretariasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Secretaria } from "../../../types/models";
import { secretariaFormSchema } from "../../../schemas/secretaria.schema";

import "../../../assets/css/ListPage.css";

export default function SecretariaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Estados dedicados à paginação Server-side
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref para controlar o atraso da busca (Debounce)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // O DataTable avisa os parâmetros, e ela busca os dados
  const fetchSecretarias = useCallback(async (params: DataTableParams) => {
    // Se o usuário ainda estiver digitando na barra de pesquisa, zera o cronômetro
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    // Espera 500ms de inatividade antes de bater no banco de dados do Django
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await secretariaApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering,
        });

        setSecretarias(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar guias de abastecimento.");
        console.error("Erro ao buscar secretarias:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Tratamento de Exclusão Paginada
  async function handleDelete(item: Secretaria) {
    if (!item.id) return;
    
    try {
      await secretariaApi.deletar(item.id);
      
      // Após excluir com sucesso, forçamos a tabela a recarregar os dados.
      // Retornar para a página 1 é uma prática segura para evitar que a tela 
      // fique presa numa página que ficou vazia após a exclusão.
      fetchSecretarias({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir guia de abastecimento."));
    }
  }

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Secretarias</h2>
          <p className="list-subtitle">Listagem de secretarias cadastradas.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.organizacao.secretarias.create}>
              <span className="plus">+</span> Nova secretaria
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
        data={secretarias}
        total={total}
        loading={loading}
        schema={secretariaFormSchema}
        onParamsChange={fetchSecretarias}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.organizacao.secretarias.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}