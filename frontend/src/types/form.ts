// 1. TIPO PARA A TABELA (Simples, focado em exibição)
export interface TableColumn {
  key: string;       // O nome do campo no JSON da API
  label: string;     // O título da coluna
  // Função opcional para formatar o dado antes de exibir (ex: datas, booleanos)
  format?: (value: any, row: any) => React.ReactNode; 
}

export interface TableSchema {
  columns: TableColumn[];
}

// TIPO DE CAMPOS ACEITO PELO FORMULÁRIO
export type FieldType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'datetime-local' 
  | 'checkbox' 
  | 'textarea' 
  | 'select' 
  | 'datalist';

export interface FieldOption {
  label: string
  value: string | number
}

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  colSpan?: 1 | 2 | 3; // Controle de colunas no Grid (1 a 3 colunas)
  
  // Propriedades futuras para selects e datalists que usaremos nas próximas etapas
  options?: Array<{ value: number | string; label: string }>;
}

export interface FormSchema {
  fields: FormField[]
}