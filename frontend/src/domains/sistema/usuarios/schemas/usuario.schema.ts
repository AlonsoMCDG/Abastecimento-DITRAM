import { IMask } from "react-imask";
import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { Usuario } from "../../../../core/types/models";
import type { ViewSchema } from "../../../../core/types/views";
import { MASKS } from "../../../../core/utils/masks";

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

const formatarCPF = (cpf?: string | null) => {
  if (!cpf) return "—";
  
  // O createPipe processa a string bruta e devolve ela formatada
  const pipe = IMask.createPipe({ mask: MASKS.CPF });
  return pipe(String(cpf));
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const usuarioViewSchema: ViewSchema<Usuario> = {
  title: (item) => `Usuário #${item.id}`,
  fields: [
    { 
      label: 'Nome', 
      render: (item) => `${item.first_name} ${item.last_name}`, 
    },
    { 
      label: 'CPF', 
      render: (item) => formatarCPF(item.cpf)
    },
    { 
      label: 'Email', 
      key: 'email' 
    },
    { 
      label: 'Papel', 
      render: (item) => item.is_superuser ? 'Super Admin' : item.is_staff ? 'Admin' : 'Comum'
    },
  ]
};