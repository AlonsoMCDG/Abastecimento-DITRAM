import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { operadoresApi } from "../../../api/operacao/operadoresApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { OperadorVeiculo } from "../../../types/models";
import { operadorListSchema, operadorViewSchema } from "../../../schemas/operador.schema";

import "../../../assets/css/ListPage.css";
import { QuickViewModal } from "../../../components/QuickViewModal";

export default function OperadorListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [operadores, setOperadores] = useState<OperadorVeiculo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<OperadorVeiculo | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_frota);

  const fetchOperadores = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await operadoresApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        setOperadores(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar operadores de veículos.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: OperadorVeiculo) {
    if (!item.id) return;
    try {
      await operadoresApi.deletar(item.id);
      setErrorMessage(null);
      fetchOperadores({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir o vínculo do operador."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Operadores de Frota</h2>
          <p className="list-subtitle">Vincule os motoristas aos seus respectivos veículos.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_frota">
            <Link className="list-create" to={ROUTES.operacao.operadoresVeiculo.create}>
              <span className="plus">+</span> Novo Vínculo
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={operadores}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={operadorListSchema}
        onParamsChange={fetchOperadores}
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.operacao.operadoresVeiculo.edit(item.id!))}
        onDelete={handleDelete}
        // Destaca levemente a linha se o motorista for o titular daquele veículo
        rowClassName={(item) => item.is_principal ? "dt-row-highlight" : ""} 
      />

      <QuickViewModal<OperadorVeiculo>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={operadorViewSchema}
        onEdit={(item) => navigate(ROUTES.operacao.operadoresVeiculo.edit(item.id!))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}