import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { ViewSchema } from "../../../../core/types/views";
import type { TipoCombustivelReadDTO } from "./tipoCombustivel.read.zod";

// --------------------------------------------------------
// FORMULÁRIO (UI SCHEMA)
// --------------------------------------------------------
export const tipoCombustivelUISchema: FormSchema = {
  fields: [
    {
      name: "nome",
      label: "Nome do Combustível",
      type: "text",
      placeholder: "Ex: Gasolina Comum, Diesel S10...",
      colSpan: 3,
      required: true
    },
    {
      name: "ativo",
      label: "Combustível Ativo (Utilizado atualmente)",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const tipoCombustivelListSchema: TableSchema = {
  columns: [
    { 
      key: "nome", 
      label: "Combustível", 
      sortKey: "nome" 
    },
    { 
      key: "slug", 
      label: "Código Identificador", 
      sortKey: "slug" 
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
export const tipoCombustivelViewSchema: ViewSchema<TipoCombustivelReadDTO> = {
  title: (item) => `Tipo de Combustível #${item.id}`,
  fields: [
    { label: 'Nome', key: 'nome' },
    { label: 'Código (Slug)', key: 'slug' },
    { label: 'Ativo', render: (item) => `${item.ativo ? 'Sim' : 'Não'}` },
  ]
};