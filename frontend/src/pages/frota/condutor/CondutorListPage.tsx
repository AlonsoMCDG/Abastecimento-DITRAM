import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { pessoasApi } from "../../../api/pessoas/pessoasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Pessoa } from "../../../types/models";
import { condutorFormSchema } from "../../../schemas/condutor.schema";

import "../../../assets/css/ListPage.css";

export default function CondutorListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Estados da Listagem e Paginação
  const [condutores, setCondutores] = useState<Pessoa[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Controle de atraso para a barra de pesquisa
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissões para botões da tabela
  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_frota);

  // Motor de busca integrado ao backend com debounce
  const fetchCondutores = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await pessoasApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
          ativo: "", // Usa "" para trazer todos
        });

        setCondutores(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        console.error("Erro ao buscar condutores:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Exclusão com tratamento de erro e recarregamento automático
  async function handleDelete(item: Pessoa) {
    if (!item.id) return;

    try {
      await pessoasApi.deletar(item.id);
      
      // Recarrega a tabela na primeira página após excluir
      fetchCondutores({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Falha ao excluir condutor."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Condutores</h2>
          <p className="list-subtitle">Cadastro e consulta de condutores.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_frota">
            <Link className="list-create" to={ROUTES.pessoas.base.create}>
              <span className="plus">+</span> Novo condutor
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={condutores}
        total={total}
        loading={loading}
        schema={condutorFormSchema}
        onParamsChange={fetchCondutores}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.pessoas.base.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}