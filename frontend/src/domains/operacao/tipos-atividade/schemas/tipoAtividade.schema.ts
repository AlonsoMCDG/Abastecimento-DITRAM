import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { ViewSchema } from "../../../../core/types/views";
import type { TipoAtividadeReadDTO } from "./tipoAtividade.read.zod";

// --------------------------------------------------------
// FORMULÁRIO (UI SCHEMA)
// --------------------------------------------------------
export const tipoAtividadeUISchema: FormSchema = {
  fields: [
    {
      name: "nome",
      label: "Nome da Atividade",
      type: "text",
      placeholder: "Ex: Roçagem, Motobomba, Borrifador...",
      colSpan: 3,
      required: true
    },
    {
      name: "ativo",
      label: "Atividade ativa no sistema?",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const tipoAtividadeListSchema: TableSchema = {
  columns: [
    { 
      key: "nome", 
      label: "Nome da Atividade", 
      sortKey: "nome" 
    },
    { 
      key: "ativo", 
      label: "Status", 
      sortKey: "ativo",
      format: (val: boolean) => val ? '✅ Ativa' : '❌ Inativa'
    }
  ]
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const tipoAtividadeViewSchema: ViewSchema<TipoAtividadeReadDTO> = {
  title: (item) => `Tipo de Atividade #${item.id}`,
  fields: [
    { label: 'Atividade', key: 'nome' },
    { label: 'Status', render: (item) => `${item.ativo ? 'Ativa' : 'Inativa'}` },
  ]
};