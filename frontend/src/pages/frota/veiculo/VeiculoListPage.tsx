import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { veiculosApi } from "../../../api/frota/veiculosApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Veiculo } from "../../../types/models";
import { veiculoListSchema } from "../../../schemas/veiculo.schema";

import "../../../assets/css/ListPage.css";

export default function VeiculoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_frota);

  const fetchVeiculos = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await veiculosApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
          ativo: "", 
        });

        setVeiculos(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar veículos no servidor.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: Veiculo) {
    if (!item.id) return;
    try {
      await veiculosApi.deletar(item.id);
      setErrorMessage(null);
      fetchVeiculos({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir veículo. Verifique dependências."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Veículos da Frota</h2>
          <p className="list-subtitle">Gerenciamento de veículos, máquinas e embarcações.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_frota">
            <Link className="list-create" to={ROUTES.frota.veiculos.create}>
              <span className="plus">+</span> Novo veículo
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={veiculos}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={veiculoListSchema}
        onParamsChange={fetchVeiculos}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.frota.veiculos.edit(item.id!))}
        onDelete={handleDelete}
        rowClassName={(v) => !v.ativo ? "dt-row-inactive" : ""}
      />
    </div>
  );
}