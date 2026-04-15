import type { FormSchema, TableSchema } from "../types/form";
import type { TipoServico } from "../types/models";
import type { ViewSchema } from "../types/views";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const tipoServicoFormSchema: FormSchema = {
  fields: [
    {
      name: "nome",
      label: "Nome do Serviço / Função",
      type: "text",
      placeholder: "Ex: Motorista de Ônibus, Roçador, Operador de Máquina...",
      colSpan: 3,
      required: true
    },
    {
      name: "ativo",
      label: "Serviço Ativo (Ainda existe no quadro atual?)",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const tipoServicoListSchema: TableSchema = {
  columns: [
    { 
      key: "nome", 
      label: "Função / Serviço", 
      sortKey: "nome" 
    },
    { 
      key: "ativo", 
      label: "Status", 
      sortKey: "ativo",
      format: (val: boolean) => val ? '✅ Ativo' : '❌ Inativo'
    }
  ]
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const instituicaoViewSchema: ViewSchema<TipoServico> = {
  title: (item) => `Instituição #${item.id}`,
  fields: [
    { label: 'Nome', key: 'nome' },
    { label: 'Ativo', render: (item) => `${item.ativo ? 'Sim' : 'Não'}` },
  ]
};