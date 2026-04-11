import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../components/DataTable";
import { pessoasApi } from "../../../api/pessoas/pessoasApi";
import { ROUTES } from "../../../routes/routes";
import { useAuth } from "../../../auth/AuthContext";
import { Can } from "../../../components/auth/Can";
import { getApiErrorMessage } from "../../../api/config/errorHandlers";

import type { Pessoa } from "../../../types/models";
import { pessoaListSchema } from "../../../schemas/pessoa.schema";

import "../../../assets/css/ListPage.css";

export default function PessoaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
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

  const fetchPessoas = useCallback(async (params: DataTableParams) => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const res = await pessoasApi.listar({
          page: params.page,
          page_size: params.pageSize,
          search: params.search,
          ordering: params.ordering ?? undefined,
          // ativo: "" // Deixe em branco para listar ativos e inativos na tela de gerência
        });

        setPessoas(res.data.results || []);
        setTotal(res.data.count || 0);
      } catch (err) {
        setErrorMessage("Erro ao buscar base de pessoas no servidor.");
      } finally {
        setLoading(false);
      }
    }, 500);
  }, []);

  async function handleDelete(item: Pessoa) {
    if (!item.id) return;
    try {
      await pessoasApi.deletar(item.id);
      setErrorMessage(null);
      fetchPessoas({ page: 1, pageSize: 10, search: "", ordering: null });
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Falha ao excluir. É provável que esta pessoa já possua alocações ou histórico no sistema."));
    }
  }

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h2 className="list-title">Cadastro de Pessoas</h2>
          <p className="list-subtitle">Gerencie o registro base de todos os funcionários e terceirizados.</p>
        </div>

        <div className="list-actions">
          <Can action="can_write_cadastros">
            <Link className="list-create" to={ROUTES.pessoas.base.create}>
              <span className="plus">+</span> Nova pessoa
            </Link>
          </Can>
        </div>
      </div>
      
      <DataTable
        data={pessoas}
        total={total}
        loading={loading}
        error={errorMessage}
        schema={pessoaListSchema}
        onParamsChange={fetchPessoas}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.pessoas.base.edit(item.id!))}
        onDelete={handleDelete}
        // Aplica classe nativa caso inativo para dar feedback visual
        rowClassName={(p) => !p.ativo ? "dt-row-inactive" : ""}
      />
    </div>
  );
}