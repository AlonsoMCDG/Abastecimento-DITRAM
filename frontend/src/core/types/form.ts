import type { FieldValues, Path } from 'react-hook-form';

// 1. TIPO PARA A TABELA (Simples, focado em exibição)
export interface TableColumn {
  key: string;
  label: string;
  // `any` de propósito: o DataTable é genérico e cada domínio tipa seu próprio render
  // (ex.: (val: boolean) => "✅"). A variância do TS não permite tipar value/item de
  // forma estrita sem generics na schema inteira, então relaxamos apenas aqui.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any, item?: any) => React.ReactNode;
  sortable?: boolean; // Permite desativar o clique em colunas específicas (ex.: Observação)
  sortKey?: string;   // O nome REAL do campo lá no banco de dados do Django
}

export interface TableSchema {
  columns: TableColumn[];
}

// 2. TIPO PARA FORMULÁRIO

export type FieldType = 
  | 'text' | 'number' | 'date' | 'datetime-local' | 'checkbox' | 'textarea' 
  | 'select' | 'datalist' | 'combobox' | 'hidden' | 'email' | 'tel' | 'password';

// Interface para os botões de ação
export interface QuickAction {
  icon: string | React.ReactNode; // Pode ser um emoji de string ou um ícone (ex.: react-icons)
  tooltip?: string;   // Dica da ação
  onClick: () => void; // O callback que a página injetará (ex.: abrir modal)
}

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FormField<T extends FieldValues = any> {
  name: Path<T>;            // Nome exato do campo no formulário/payload (ex.: 'veiculo_id')
  label: string;           // Texto de cabeçalho visível para o usuário
  type: FieldType;         // Tipo do componente visual (ex.: 'text', 'select', 'datalist')
  required?: boolean;      // Define se o preenchimento é obrigatório para salvar
  readOnly?: boolean;      // Impede a edição, mas o campo ainda é submetido no payload
  disabled?: boolean;      // Desabilita totalmente a interação (geralmente fica acinzentado)
  placeholder?: string;    // Texto de dica exibido quando o input está vazio
  colSpan?: 1 | 2 | 3;     // Largura do campo na grade visual (3 = ocupa a linha inteira)
  options?: FieldOption[]; // Opções manuais/estáticas para selects
  endpoint?: string;       // Rota da API para carregar opções dinâmicas de lookup (Para campos Select)
  dependsOn?: string;      // Nome (name) de outro campo que este observa para recarregar/filtrar dados
  dependsOnParam?: string; // Nome do query parameter enviado à API (ex.: '?secretaria_id=') para filtrar opções
  quickActions?: QuickAction[]; // Botões de atalho embutidos no campo (ex.: '➕ Novo')
  prefix?: string | React.ReactNode;  // Elemento renderizado no início do input (ex.: 'R$')
  suffix?: string | React.ReactNode;  // Elemento renderizado no final do input (ex.: 'km/L')
  mask?: any;              // Lógica de formatação do texto digitado (ex.: máscara de CPF)
  visibleIf?: (values: Partial<T>) => boolean; // Função condicional para mostrar ou ocultar este campo
  creatable?: boolean;     // Permite que o usuário digite um valor novo que não está na lista
}

export interface FormSchema<T extends FieldValues = any> {
  fields: FormField<T>[]
}