import { useEffect, useState } from "react";
import type { TableSchema } from "../types/form";
import { getApiErrorMessage } from "../api/config/errorHandlers";
import "../assets/css/DataTable.css";

export interface DataTableParams {
  page: number;
  pageSize: number;
  search: string;
  ordering: string | null;
}

interface Props<T> {
  data: T[];
  total: number;
  loading?: boolean;
  error?: string | null;
  schema: TableSchema;
  onParamsChange: (params: DataTableParams) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void | Promise<void>;
  onView?: (item: T) => void; // Prop para Modal Rápido
  onPdf?: (item: T, action: 'open' | 'print') => void | Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
  pageSizeOptions?: number[];
  rowClassName?: (item: T) => string; 
}

export default function DataTable<T extends { id: number }>({
  data,
  total,
  loading = false,
  error = null,
  schema,
  onParamsChange,
  onEdit,
  onDelete,
  onView,
  onPdf,
  canEdit = true,
  canDelete = true,
  pageSizeOptions = [10, 20, 50, 100],
  rowClassName,
}: Props<T>) {

  const [params, setParams] = useState<DataTableParams>({
    page: 1,
    pageSize: pageSizeOptions[0],
    search: "",
    ordering: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [actionLoading, setActionLoading] = useState<{ id: number, action: string } | null>(null);

  const hasActions = Boolean(onPdf || canEdit || canDelete);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setParams((prev) => {
        if (prev.search === searchTerm) return prev;
        return { ...prev, search: searchTerm, page: 1 };
      });
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    onParamsChange(params);
  }, [params, onParamsChange]);

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (col: any) => {
    if (col.sortable === false) return;

    const columnKey = col.sortKey || col.key;
    setParams((prev) => {
      const currentOrderField = prev.ordering?.replace("-", "");

      if (currentOrderField !== columnKey) {
        return { ...prev, ordering: columnKey, page: 1 };
      }

      const isDescending = prev.ordering?.startsWith("-");
      const newOrdering = isDescending ? columnKey : `-${columnKey}`;
      return { ...prev, ordering: newOrdering, page: 1 };
    });
  };

  const totalPages = Math.ceil(total / params.pageSize) || 1;

  async function confirmDelete() {
    if (!deleteTarget || !onDelete) return;
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await Promise.resolve(onDelete(deleteTarget));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, "Erro ao excluir registro."));
    } finally {
      setDeleteLoading(false);
    }
  }

  const handlePdfClick = async (item: T, action: 'open' | 'print') => {
    if (!onPdf) return;
    setActionLoading({ id: item.id, action });
    try {
      await Promise.resolve(onPdf(item, action));
    } finally {
      setActionLoading(null);
    }
  };

  function renderCell(value: any, col: any, item: T) {
    if (col.format) return col.format(value, item);
    if (typeof value === "boolean") {
      return (
        <span className={`dt-badge ${value ? "dt-badge-yes" : "dt-badge-no"}`}>
          {value ? "Sim" : "Não"}
        </span>
      );
    }
    if (value === null || value === undefined) return "";
    return String(value);
  }

  return (
    <div className={`datatable-container ${loading ? "is-loading" : ""}`}>
      {error && (<div className="dt-global-error">{error}</div>)}

      <div className="datatable-toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            className="datatable-search"
            placeholder="Pesquisar no banco de dados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading && <div className="inner-spinner"></div>}
        </div>
      </div>

      <div className="datatable-tablewrap">
        <table className="datatable-table">
          <thead>
            <tr>
              <th className="dt-index-col">#</th>
              {schema.columns.map((col) => {
                const targetKey = col.sortKey || col.key;
                const isSorted = params.ordering?.replace("-", "") === targetKey;
                const isDescending = params.ordering?.startsWith("-");

                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col)}
                    className={col.sortable !== false ? "sortable-th" : ""}
                  >
                    {col.label}
                    {isSorted && (
                      <span className="sort-icon">{isDescending ? " ▼" : " ▲"}</span>
                    )}
                  </th>
                );
              })}
              {hasActions && <th className="actions-th">Ações</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => {
                const rowNumber = (params.page - 1) * params.pageSize + index + 1;
                const customClass = rowClassName ? rowClassName(item) : "";

                return (
                  <tr key={item.id} className={customClass}>
                    <td className="dt-index-cell">
                      {rowNumber}
                    </td>

                    {schema.columns.map((col) => {
                      const value = (item as any)[col.key];
                      return (
                        <td key={col.key}>
                          {renderCell(value, col, item)}
                        </td>
                      );
                    })}
                    
                    {hasActions && (
                      <td className="dt-actions-cell">
                        <div className="dt-actions">
                          {onView && (
                            <button 
                              className="dt-btn view" 
                              onClick={() => onView(item)} 
                              title="Visualizar Detalhes"
                            >
                              👁️
                            </button>
                          )}
                          {onPdf && (
                            <>
                              {/* <button
                                className="dt-btn pdf"
                                onClick={() => handlePdfClick(item, 'open')}
                                title="Visualizar PDF"
                                disabled={actionLoading?.id === item.id}
                              >
                                {actionLoading?.id === item.id && actionLoading.action === 'open' ? '⏳' : '👁️'}
                              </button> */}
                              <button
                                className="dt-btn pdf"
                                onClick={() => handlePdfClick(item, 'print')}
                                title="Imprimir PDF"
                                disabled={actionLoading?.id === item.id}
                              >
                                {actionLoading?.id === item.id && actionLoading.action === 'print' ? '⏳' : '🖨️'}
                              </button>
                            </>
                          )}
                          {canEdit && onEdit && (
                            <button className="dt-btn edit" onClick={() => onEdit(item)} title="Editar" disabled={actionLoading?.id === item.id}>✏️</button>
                          )}
                          {canDelete && onDelete && (
                            <button className="dt-btn delete" onClick={() => setDeleteTarget(item)} title="Excluir" disabled={actionLoading?.id === item.id}>🗑️</button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={schema.columns.length + 2} className="td-empty">
                  {loading ? "Carregando dados..." : "Nenhum registro encontrado."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="datatable-footer">
        <div className="footer-info">
          Total: <strong>{total}</strong> registros
        </div>

        <div className="footer-controls">
          <select
            className="dt-select-pagesize"
            value={params.pageSize}
            onChange={(e) => setParams(p => ({ ...p, pageSize: Number(e.target.value), page: 1 }))}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n} por página</option>
            ))}
          </select>

          <div className="dt-pagination-btns">
            <button disabled={params.page <= 1 || loading} onClick={() => handlePageChange(1)}>«</button>
            <button disabled={params.page <= 1 || loading} onClick={() => handlePageChange(params.page - 1)}>Anterior</button>
            <span className="page-indicator">{params.page} / {totalPages}</span>
            <button disabled={params.page >= totalPages || loading} onClick={() => handlePageChange(params.page + 1)}>Próxima</button>
            <button disabled={params.page >= totalPages || loading} onClick={() => handlePageChange(totalPages)}>»</button>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {deleteTarget && (
        <div className="dt-modal-overlay">
          <div className="dt-modal">
            <h3>Confirmar Exclusão</h3>
            <p>Deseja realmente excluir o registro <strong>#{deleteTarget.id}</strong>?</p>
            {deleteError && <div className="dt-error-msg">{deleteError}</div>}
            <div className="dt-modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>Cancelar</button>
              <button className="btn-confirm-delete" onClick={confirmDelete} disabled={deleteLoading}>
                {deleteLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}