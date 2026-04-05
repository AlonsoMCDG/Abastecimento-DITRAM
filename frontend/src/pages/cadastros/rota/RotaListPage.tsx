import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { rotaApi } from "../../../api/frota/rotasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Rota } from "../../../types/models";
import { rotaFormSchema } from "../../../schemas/rota.schema";

import "../../../assets/css/ListPage.css";

export default function RotaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Estados dedicados à paginação Server-side
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Controle de atraso para não sobrecarregar a API durante a digitação
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissão genérica para as ações das linhas da tabela
  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  // Motor de busca paginado
  const fetchRotas = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await rotaApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
          ativa: "", // Permite trazer rotas inativas também
        });

        setRotas(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        console.error("Erro ao buscar rotas:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Exclusão segura com refresh silencioso
  async function handleDelete(item: Rota) {
    if (!item.id) return;

    try {
      await rotaApi.deletar(item.id);
      
      // Retorna à primeira página após a exclusão para atualizar a tabela
      fetchRotas({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Falha ao excluir rota."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Rotas</h2>
          <p className="list-subtitle">Rotas ativas e inativas cadastradas.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.frota.rotas.create}>
              <span className="plus">+</span> Nova rota
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={rotas}
        total={total}
        loading={loading}
        schema={rotaFormSchema}
        onParamsChange={fetchRotas}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.frota.rotas.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}