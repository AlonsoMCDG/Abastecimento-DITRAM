import { useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { instituicoesApi } from "../../../api/organizacao/instituicoesApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Instituicao } from "../../../types/models";
import { instituicaoFormSchema } from "../../../schemas/instituicao.schema";

import "../../../assets/css/ListPage.css";

export default function InstituicaoListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  // Estados da paginação e listagem
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Permissão genérica para as ações das linhas da tabela
  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  // Motor de busca com integração ao backend (Debounce de 500ms)
  const fetchInstituicoes = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await instituicoesApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
        });

        setInstituicoes(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        console.error("Erro ao buscar instituições:", err);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  // Tratamento seguro de exclusão com refresh da tabela
  async function handleDelete(item: Instituicao) {
    if (!item.id) return;

    try {
      await instituicoesApi.deletar(item.id);
      
      // Retorna para a página 1 após excluir, evitando telas vazias
      fetchInstituicoes({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      alert(getApiErrorMessage(err, "Falha ao excluir instituição."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Instituições</h2>
          <p className="list-subtitle">Escolas, UPA, hospitais e outros.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.organizacao.instituicoes.create}>
              <span className="plus">+</span> Nova instituição
            </Link>
          </Can>
        </div>
      </div>

      <DataTable
        data={instituicoes}
        total={total}
        loading={loading}
        schema={instituicaoFormSchema}
        onParamsChange={fetchInstituicoes}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.organizacao.instituicoes.edit(item.id!))}
        onDelete={handleDelete}
      />
    </div>
  );
}