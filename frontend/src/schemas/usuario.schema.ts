import type { FormSchema, TableSchema } from "../types/form";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const usuarioFormSchema: FormSchema = {
  fields: [
    {
      name: "first_name",
      label: "Nome",
      type: "text",
      colSpan: 1,
      required: true,
    },
    {
      name: "last_name",
      label: "Sobrenome",
      type: "text",
      colSpan: 2,
      required: true,
    },
    {
      name: "cpf",
      label: "CPF",
      type: "text", // Mude para type: 'text' e use a prop mask se tiver (ex: mask: '000.000.000-00')
      colSpan: 1,
      required: true,
    },
    {
      name: "email",
      label: "E-mail",
      type: "email",
      colSpan: 2,
      required: false,
    },
    {
      name: "password",
      label: "Senha",
      type: "password", // Oculta a digitação
      placeholder: "Preencha para alterar", // Dica visual para edição
      colSpan: 3,
      required: false, // O backend exige na criação, mas na edição é opcional
    },
  ],
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const usuarioListSchema: TableSchema = {
  columns: [
    {
      key: 'first_name', // Nome base para ordenação
      label: 'Nome Completo',
      sortKey: 'first_name',
      format: (_, item: any) => `${item.first_name || ''} ${item.last_name || ''}`.trim() || '-'
    },
    {
      key: 'cpf',
      label: 'CPF',
      sortKey: 'cpf',
    },
    {
      key: 'email',
      label: 'E-mail',
      sortKey: 'email',
    },
    {
      key: 'is_staff',
      label: 'Admin',
      sortKey: 'is_staff',
      format: (val: boolean) => val ? '👑 Sim' : 'Usuário',
    },
  ]
};