import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { secretariaApi } from "../../../api/organizacao/secretariasApi"; // Ajuste o caminho se necessário
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Secretaria } from "../../../types/models";
import { secretariaListSchema } from "../../../schemas/secretaria.schema";

import "../../../assets/css/ListPage.css";

export default function SecretariaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchSecretarias = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await secretariaApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
          // Deixe 'ativo' em branco para listar tanto as ativas quanto as inativas na gerência
        });

        setSecretarias(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar secretarias no servidor.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: Secretaria) {
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
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.organizacao.secretarias.edit(item.id!))}
        onDelete={handleDelete}
        rowClassName={(s) => !s.ativo ? "dt-row-inactive" : ""}
      />
    </div>
  );
}