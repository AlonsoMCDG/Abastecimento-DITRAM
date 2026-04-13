// 1. TIPO PARA A TABELA (Simples, focado em exibição)
export interface TableColumn {
  key: string;
  label: string;
  format?: (value: any, item?: any) => React.ReactNode;
  sortable?: boolean; // Permite desativar o clique em colunas específicas (ex: Observação)
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
  icon: string; // Pode ser um emoji de string ou um ícone (ex: react-icons)
  tooltip?: string;
  onClick: () => void; // O callback que a página injetará (ex: abrir modal)
}

export interface FieldOption {
  label: string
  value: string | number
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2 | 3;
  options?: Array<{ value: number | string; label: string }>;
  endpoint?: string;       // Entidade para o lookup (ex: 'veiculos')
  dependsOn?: string;      // Nome do campo que este campo observa
  dependsOnParam?: string; // Nome do parâmetro na API (ex: 'secretaria_id')
  quickActions?: QuickAction[];
  prefix?: string | React.ReactNode;  // (Ex: R$, Kg, m²) 
  suffix?: string | React.ReactNode;  // (Ex: R$, Kg, m²)
  mask?: any;
}

export interface FormSchema {
  fields: FormField[]
}