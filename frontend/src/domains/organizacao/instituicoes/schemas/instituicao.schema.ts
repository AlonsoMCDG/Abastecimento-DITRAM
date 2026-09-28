import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { ViewSchema } from "../../../../core/types/views";
import { ENDPOINTS } from "../../../../core/api/endpoints";
import type { InstituicaoReadDTO } from "./instituicao.read.zod";

// --------------------------------------------------------
// FORMULÁRIO (UI SCHEMA)
// --------------------------------------------------------
export const instituicaoUISchema: FormSchema = {
  fields: [
    {
      name: "nome",
      label: "Nome da Instituição",
      type: "text",
      placeholder: "Ex: Escola Municipal João das Neves",
      colSpan: 3,
      required: true,
    },
    {
      name: "tipo",
      label: "Tipo",
      type: "select",
      // Fonte única de verdade: Instituicao.TIPO_CHOICES no backend
      endpoint: ENDPOINTS.choices.instituicaoTipo,
      colSpan: 1,
      required: true,
    },
    {
      name: "secretaria_id",
      label: "Secretaria Vinculada",
      type: "select",
      required: true,
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      colSpan: 3,
    },
    {
      name: "ativo",
      label: "Instituição Ativa (Em operação atual)",
      type: "checkbox",
      colSpan: 3,
      required: false,
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

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const instituicaoViewSchema: ViewSchema<InstituicaoReadDTO> = {
  title: (item) => `Instituição #${item.id}`,
  fields: [
    { label: 'Nome', key: 'nome', fullWidth: true },
    { label: 'Secretaria', key: 'secretaria_nome' },
    { label: 'Tipo', key: 'tipo_nome' },
    { label: 'Ativo', render: (item) => `${item.ativo ? 'Sim' : 'Não'}` },
  ]
};