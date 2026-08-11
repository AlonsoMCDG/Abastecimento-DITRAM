import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, {
  type DataTableParams
} from "../../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../../core/ui/overlays/QuickViewModal";

import { veiculosApi } from "../api/veiculos.api";
import { ROUTES } from "../../../../core/routes/routes";
import { useAuth } from "../../../../core/auth/AuthContext";
import { Can } from "../../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../../core/api/errorHandlers";

import type { VeiculoReadDTO } from "../schemas/veiculo.dto";
import {
  veiculoListSchema,
  veiculoViewSchema
} from "../schemas/veiculo.ui";

import "../../../../core/ui/layouts/ListPage.css";


export default function VeiculoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [veiculos, setVeiculos] = useState<VeiculoReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<VeiculoReadDTO | null>(null);

  const canEdit = Boolean(
    me?.is_staff || me?.can_write_frota
  );

  const canDelete = Boolean(
    me?.is_staff || me?.can_write_frota
  );


  const fetchVeiculos = useCallback(
    async (params: DataTableParams) => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const res = await veiculosApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering || undefined,
        });

        setVeiculos(res.results || []);
        setTotal(res.count || 0);

      } catch (err) {
        setErrorMessage(
          "Erro ao buscar veículos no servidor."
        );
        console.error(err);

      } finally {
        setLoading(false);
      }
    },
    []
  );


  async function handleDelete(item: VeiculoReadDTO) {
    if (!item.id) return;

    try {
      await veiculosApi.deletar(item.id);

      setErrorMessage(null);

      // Recarrega a primeira página após a exclusão
      fetchVeiculos({
        page: 1,
        pageSize: 10,
        search: "",
        ordering: null
      });

    } catch (err: unknown) {
      setErrorMessage(
        getApiErrorMessage(
          err,
          "Falha ao excluir veículo. É provável que ele possua histórico de guias. Considere inativá-lo."
        )
      );
    }
  }


  return (
    <div className="list-page">

      <div className="list-header">

        <div>
          <h2 className="list-title">
            Veículos da Frota
          </h2>

          <p className="list-subtitle">
            Gerenciamento de veículos, máquinas e embarcações.
          </p>
        </div>


        <div className="list-actions">
          <Can action="can_write_frota">
            <Link
              className="list-create"
              to={ROUTES.frota.veiculos.create}
            >
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
        onView={(item) => setViewItem(item)}

        canEdit={canEdit}
        canDelete={canDelete}

        onEdit={(item) =>
          navigate(
            ROUTES.frota.veiculos.edit(item.id)
          )
        }

        onDelete={handleDelete}

        rowClassName={(veiculo) =>
          !veiculo.ativo
            ? "dt-row-inactive"
            : ""
        }
      />


      <QuickViewModal<VeiculoReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={veiculoViewSchema}

        onEdit={(item) =>
          navigate(
            ROUTES.frota.veiculos.edit(item.id)
          )
        }

        canEdit={canEdit}
      />

    </div>
  );
}