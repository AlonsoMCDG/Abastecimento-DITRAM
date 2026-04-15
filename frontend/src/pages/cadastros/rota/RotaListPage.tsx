import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { rotaApi } from "../../../api/frota/rotasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Rota } from "../../../types/models";
import { rotaListSchema, rotaViewSchema } from "../../../schemas/rota.schema";

import "../../../assets/css/ListPage.css";
import { QuickViewModal } from "../../../components/QuickViewModal";

export default function RotaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [rotas, setRotas] = useState<Rota[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<Rota | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpa o timer se o componente for desmontado (Prevenção de Memory Leak)
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Padronizado para separar as permissões de edição e exclusão (mesmo que na sua regra atual sejam a mesma)
  const canEdit = Boolean(me?.is_staff || me?.can_write_cadastros);
  const canDelete = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchRotas = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await rotaApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
          ativa: "", // Traz ativas e inativas
        });

        setRotas(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar rotas de transporte.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: Rota) {
    if (!item.id) return;
    try {
      await rotaApi.deletar(item.id);
      setErrorMessage(null);
      fetchRotas({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir rota."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Rotas de Transporte</h2>
          <p className="list-subtitle">Gerencie os percursos, distâncias e consumos estimados.</p>
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
        error={errorMessage}
        schema={rotaListSchema}
        onParamsChange={fetchRotas}
        onView={(item) => setViewItem(item)}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(item) => navigate(ROUTES.frota.rotas.edit(item.id!))}
        onDelete={handleDelete}
      />

      <QuickViewModal<Rota>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={rotaViewSchema}
        onEdit={(item) => navigate(ROUTES.frota.rotas.edit(item.id!))}
      />
    </div>
  );
}