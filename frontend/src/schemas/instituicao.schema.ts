import type { FormSchema, TableSchema } from "../types/form";
import { ENDPOINTS } from "../api/config/endpoints";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const instituicaoFormSchema: FormSchema = {
  fields: [
    {
      name: "nome",
      label: "Nome da Instituição",
      type: "text",
      placeholder: "Ex: Escola Municipal João das Neves",
      colSpan: 3,
      required: true
    },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      options: [
        { value: 'ESCOLA', label: 'Escola' },
        { value: 'CRECHE', label: 'Creche' },
        { value: 'UPA', label: 'UPA' },
        { value: 'HOSPITAL', label: 'Hospital' },
        { value: 'OUTRO', label: 'Outro' },
      ],
      colSpan: 1,
      required: true
    },
    {
      name: "secretaria_id", // Bate com o ForeignKey do Django
      label: "Secretaria Vinculada",
      type: "select",
      required: true,
      endpoint: ENDPOINTS.organizacao.secretariasLookup, // Usa o endpoint otimizado
      colSpan: 3
    },
    {
      name: "ativo",
      label: "Instituição Ativa (Em operação atual)",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const instituicaoListSchema: TableSchema = {
  columns: [
    { 
      key: "nome", 
      label: "Instituição", 
      sortKey: "nome" 
    },
    { 
      key: "tipo_nome",
      label: "Tipo", 
      sortKey: "tipo" 
    },
    { 
      key: "secretaria_sigla", 
      label: "Secretaria", 
      sortKey: "secretaria__sigla" 
    },
    { 
      key: "ativo", 
      label: "Status", 
      sortKey: "ativo",
      format: (val: boolean) => val ? '✅ Ativa' : '❌ Inativa'
    }
  ]
};