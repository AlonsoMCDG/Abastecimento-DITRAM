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

export type FieldType = 
  | 'text' | 'number' | 'date' | 'datetime-local' 
  | 'checkbox' | 'textarea' | 'select' | 'datalist';

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
  colSpan?: 1 | 2 | 3;
  options?: Array<{ value: number | string; label: string }>;
  
  endpoint?: string;       // Entidade para o lookup (ex: 'veiculos')
  dependsOn?: string;      // Nome do campo que este campo observa
  dependsOnParam?: string; // Nome do parâmetro na API (ex: 'secretaria_id')
}

export interface FormSchema {
  fields: FormField[]
}