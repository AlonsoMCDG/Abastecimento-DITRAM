import type { FormSchema, TableSchema } from "../types/form";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const secretariaFormSchema: FormSchema = {
  fields: [
    {
      name: "sigla",
      label: "Sigla",
      type: "text",
      placeholder: "Ex: SEME",
      colSpan: 1, // Fica mais estreito na tela
      required: true
    },
    {
      name: "nome",
      label: "Nome da Secretaria",
      type: "text",
      placeholder: "Ex: Secretaria Municipal de Educação",
      colSpan: 3, // Ocupa o resto do espaço
      required: true
    },
    {
      name: "ativo",
      label: "Secretaria Ativa (Em operação na atual gestão)",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const secretariaListSchema: TableSchema = {
  columns: [
    { 
      key: "sigla", 
      label: "Sigla", 
      sortKey: "sigla" 
    },
    { 
      key: "nome", 
      label: "Nome Completo", 
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