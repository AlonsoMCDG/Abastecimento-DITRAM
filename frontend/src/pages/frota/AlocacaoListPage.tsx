import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../components/DataTable";
import { alocacaoFormSchema } from "../../schemas/alocacao.schema";
import { alocacoesApi } from "../../api/operacao/alocacoesApi";
import { ROUTES } from "../../routes/routes";
import { useAuth } from "../../auth/AuthContext";
import { Can } from "../../components/auth/Can";
import { getApiErrorMessage } from "../../api/config/errorHandlers";

import type { AlocacaoServico } from "../../types/models";
import "../../assets/css/ListPage.css";

export default function AlocacaoListPage() {
  const navigate = useNavigate();
  
  // 1. Traz o usuário logado instantaneamente do contexto global
  const { user: me } = useAuth();

  // 2. Estados da Listagem e Paginação Server-side
  const [items, setItems] = useState<AlocacaoServico[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Controle de atraso para a barra de pesquisa
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 3. Permissões para botões internos da tabela
  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_frota);

  // 4. Motor de busca integrado ao backend com debounce de 500ms
  const fetchLotacoes = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await alocacoesApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        // Certifique-se de que alocacoesApi.listar retorna PaginatedResponse<AlocacaoServico>
        setItems(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        console.error("Erro ao buscar lotações:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // 5. Exclusão com tratamento de erro e recarregamento silencioso
  async function handleDelete(item: AlocacaoServico) {
    if (!item.id) return;

    try {
      await alocacoesApi.deletar(item.id);
      
      // Recarrega a tabela retornando à primeira página após excluir
      fetchLotacoes({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Falha ao excluir lotação."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Lotações</h2>
          <p className="list-subtitle">Vínculos entre condutor, rota e veículo.</p>
        </div>

        <div className="list-actions">
          {/* Componente Can protegendo visualmente a criação */}
          <Can action="can_write_frota">
            <Link className="list-create" to={ROUTES.operacao.alocacoesServico.create}>
              <span className="plus">+</span> Nova lotação
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={items}
        total={total}
        loading={loading}
        schema={alocacaoFormSchema}
        onParamsChange={fetchLotacoes}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.operacao.alocacoesServico.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}