import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { ViewSchema } from "../../../../core/types/views";
import { MASKS } from "../../../../core/utils/masks";
import type { UsuarioReadDTO } from "./usuario.read.zod";

// --------------------------------------------------------
// FORMULÁRIOS
// --------------------------------------------------------
export const usuarioUISchema: FormSchema = {
  fields: [
    { name: "first_name", label: "Nome", type: "text", colSpan: 1, required: true },
    { name: "last_name", label: "Sobrenome", type: "text", colSpan: 2, required: true },
    { name: "cpf", label: "CPF", type: "text", mask: MASKS.CPF, colSpan: 1, required: true },
    { name: "email", label: "E-mail", type: "email", colSpan: 2 },
    { 
      name: "password", 
      label: "Senha", 
      type: "password", 
      placeholder: "Preencha para alterar", 
      colSpan: 3, 
    },
  ],
};

export const perfilUISchema: FormSchema = {
  fields: [
    { name: "cpf", label: "CPF (Apenas Leitura)", type: "text", mask: MASKS.CPF, colSpan: 2, disabled: true },
    { name: "email", label: "E-mail", type: "email", colSpan: 2 },
    { name: "first_name", label: "Primeiro nome", type: "text", colSpan: 2, required: true },
    { name: "last_name", label: "Sobrenome", type: "text", colSpan: 2, required: true },
    // A mágica de edição de perfil:
    { name: "password", label: "Nova senha (opcional)", type: "password", colSpan: 2 },
    { name: "password2", label: "Confirmar nova senha", type: "password", colSpan: 2 },
  ]
};

// --------------------------------------------------------
// DATATABLES & VIEWS
// --------------------------------------------------------
export const usuarioListSchema: TableSchema = {
  columns: [
    {
      key: 'first_name',
      label: 'Nome Completo',
      sortKey: 'first_name',
      format: (_, u: UsuarioReadDTO) => `${u.first_name || ''} ${u.last_name || ''}`.trim() || '-'
    },
    {
      key: 'cpf',
      label: 'CPF',
      sortKey: 'cpf',
      format: (val: string) => val ? val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : '-'
    },
    { key: 'email', label: 'E-mail', sortKey: 'email' },
    {
      key: 'is_staff',
      label: 'Perfil',
      sortKey: 'is_staff',
      format: (_, u: UsuarioReadDTO) => u.is_superuser ? '💎 Superadmin' : u.is_staff ? '👑 Admin' : 'Comum',
    },
  ]
};

export const usuarioViewSchema: ViewSchema<UsuarioReadDTO> = {
  title: (item) => `Usuário #${item.id}`,
  fields: [
    { label: 'Nome', render: (item) => `${item.first_name || ''} ${item.last_name || ''}` },
    { label: 'CPF', render: (item) => item.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') },
    { label: 'Email', key: 'email' },
    { label: 'Papel', render: (item) => item.is_superuser ? 'Super Admin' : item.is_staff ? 'Admin' : 'Usuário Comum' },
  ]
};