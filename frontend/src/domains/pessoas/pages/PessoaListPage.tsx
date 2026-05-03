import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import DataTable, { type DataTableParams } from "../../../core/ui/data-display/DataTable";
import { QuickViewModal } from "../../../core/ui/overlays/QuickViewModal";

import { pessoasApi } from "../pessoas.api";
import { ROUTES } from "../../../core/routes/routes";
import { useAuth } from "../../../core/auth/AuthContext";
import { Can } from "../../../core/auth/components/Can";
import { getApiErrorMessage } from "../../../core/api/errorHandlers";

import type { PessoaReadDTO } from "../schemas/pessoa.read.zod";
import { pessoaListSchema, pessoaViewSchema } from "../schemas/pessoa.schema";

import "../../../core/ui/layouts/ListPage.css"; // Atualizado para o caminho do novo layout CSS central

export default function PessoaListPage() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [pessoas, setPessoas] = useState<PessoaReadDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<PessoaReadDTO | null>(null);

  const hasWritePermission = Boolean(me?.is_staff || me?.can_write_cadastros);

  const fetchPessoas = useCallback(async (params: DataTableParams) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await pessoasApi.listar({
        page: params.page,
        page_size: params.pageSize,
        search: params.search,
        ordering: params.ordering || undefined,
      });

      setPessoas(res.results || []);
      setTotal(res.count || 0);
    } catch (err) {
      setErrorMessage("Erro ao buscar base de pessoas no servidor.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleDelete(item: PessoaReadDTO) {
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
        onView={(item) => setViewItem(item)}
        canEdit={hasWritePermission}
        canDelete={hasWritePermission}
        onEdit={(item) => navigate(ROUTES.pessoas.base.edit(item.id))}
        onDelete={handleDelete}
        rowClassName={(p) => !p.ativo ? "dt-row-inactive" : ""}
      />

      <QuickViewModal<PessoaReadDTO>
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        data={viewItem}
        schema={pessoaViewSchema}
        onEdit={(item) => navigate(ROUTES.pessoas.base.edit(item.id))}
        canEdit={hasWritePermission}
      />
    </div>
  );
}