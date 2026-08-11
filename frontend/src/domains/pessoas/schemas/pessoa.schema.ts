import type { FormSchema, TableSchema } from "../../../core/types/form";
import type { ViewSchema } from "../../../core/types/views";
import type { PessoaReadDTO } from "./pessoa.read.zod";
import { MASKS } from "../../../core/utils/masks";

// --------------------------------------------------------
// FORMULÁRIO (UI SCHEMA)
// --------------------------------------------------------
export const pessoaUISchema: FormSchema = {
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
      sortKey: "cpf",
      format: (val: string) => val ? val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'
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
export const pessoaViewSchema: ViewSchema<PessoaReadDTO> = {
  title: (item) => `Pessoa #${item.id}`,
  fields: [
    { label: 'Nome', key: 'nome', fullWidth: true },
    { label: 'CPF', render: (item) => item.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') },
    { label: 'Ativo', render: (item) => `${item.ativo ? 'Sim' : 'Não'}` },
  ]
};