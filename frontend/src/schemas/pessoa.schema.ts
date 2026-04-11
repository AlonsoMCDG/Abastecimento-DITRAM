import type { FormSchema, TableSchema } from "../types/form";
import { MASKS } from "../utils/masks"; // Assumindo que você tem as máscaras isoladas

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const pessoaFormSchema: FormSchema = {
  fields: [
    {
      name: "nome",
      label: "Nome Completo",
      type: "text",
      placeholder: "Digite o nome completo",
      colSpan: 3,
      required: true
    },
    {
      name: "cpf",
      label: "CPF",
      type: "text",
      mask: MASKS.CPF,
      placeholder: "000.000.000-00",
      colSpan: 1,
      required: true
    },
    {
      name: "ativo",
      label: "Cadastro Ativo no Sistema",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const pessoaListSchema: TableSchema = {
  columns: [
    { 
      key: "nome", 
      label: "Nome Completo", 
      sortKey: "nome" 
    },
    { 
      key: "cpf", 
      label: "CPF", 
      sortKey: "cpf" 
    },
    { 
      key: "ativo", 
      label: "Status", 
      sortKey: "ativo",
      format: (val: boolean) => val ? '✅ Ativo' : '❌ Inativo'
    }
  ]
};