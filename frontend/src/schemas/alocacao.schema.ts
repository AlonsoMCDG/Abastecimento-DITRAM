import type { FormSchema, TableSchema } from "../types/form";
import { ENDPOINTS } from "../api/config/endpoints";
import type { AlocacaoPessoa } from "../types/models";
import type { ViewSchema } from "../types/views";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const alocacaoFormSchema: FormSchema = {
  fields: [
    {
      name: "pessoa_id",
      label: "Funcionário / Motorista",
      type: "select",
      endpoint: ENDPOINTS.pessoas.lookup,
      colSpan: 3,
      required: true,
    },
    {
      name: "tipo_servico_id",
      label: "Tipo de Serviço (Função)",
      type: "select",
      endpoint: ENDPOINTS.operacao.tiposServicoLookup,
      colSpan: 2,
      required: true,
    },
    {
      name: "secretaria_id",
      label: "Secretaria de Lotação",
      type: "select",
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      colSpan: 1,
      required: true,
    },
    {
      name: "is_principal",
      label: "⭐ É a função principal deste funcionário?",
      type: "checkbox",
      colSpan: 3,
      required: false,
    },
  ],
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const alocacaoListSchema: TableSchema = {
  columns: [
    {
      key: "pessoa_nome",
      label: "Funcionário",
      sortKey: "pessoa__nome",
    },
    {
      key: "tipo_servico_nome",
      label: "Serviço Alocado",
      sortKey: "tipo_servico__nome",
    },
    {
      key: "secretaria_sigla",
      label: "Secretaria",
      sortKey: "secretaria__sigla",
    },
    {
      key: "is_principal",
      label: "Status",
      sortKey: "is_principal",
      format: (val: boolean) => val ? '⭐ Principal' : 'Secundário',
    },
  ],
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const alocacaoViewSchema: ViewSchema<AlocacaoPessoa> = {
  title: (item) => `Alocação #${item.id}`,
  fields: [
    { label: 'Motorista/Operador', key: 'pessoa_nome' },
    { label: 'Serviço Prestado', key: 'tipo_servico_nome' },
    { 
      label: 'Secretaria', 
      key: 'secretaria_nome'
    },
    { label: 'Status', render: (item) => `${item.is_principal ? '⭐ Principal' : 'Secundário'}` },
  ]
};