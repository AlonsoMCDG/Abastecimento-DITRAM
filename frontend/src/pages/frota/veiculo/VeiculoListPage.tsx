import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { veiculosApi } from "../../../api/frota/veiculosApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Veiculo } from "../../../types/models";
import { veiculoSchema } from "../../../schemas/veiculo.schema";

import "../../../assets/css/ListPage.css";

export default function VeiculoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();
  
  // Estados da Listagem e Paginação
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Controle de atraso para a barra de pesquisa
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissão centralizada
  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_frota);

  // Motor de busca integrado ao backend com debounce
  const fetchVeiculos = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await veiculosApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering,
        });

        setVeiculos(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (error) {
        console.error("Erro ao carregar veículos:", error);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Exclusão com tratamento de erro e recarregamento automático
  const handleDelete = async (item: Veiculo) => {
    if (!item.id) return;
    
    try {
      await veiculosApi.deletar(item.id);
      
      // O frontend busca a página 1 novamente, a linha some instantaneamente sem piscar a tela
      fetchVeiculos({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Falha ao excluir veículo."));
    }
  };

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Veículos</h2>
          <p className="list-subtitle">Gerenciamento da frota de veículos.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_frota">
            <Link className="list-create" to={ROUTES.frota.veiculos.create}>
              <span className="plus">+</span> Novo Veículo
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={veiculos}
        total={total}
        loading={loading}
        schema={veiculoSchema}
        onParamsChange={fetchVeiculos}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.frota.veiculos.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}