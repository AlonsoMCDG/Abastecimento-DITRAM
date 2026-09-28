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

export type FieldType = 'text' | 'number' | 'date' | 'datetime-local' |
  'checkbox' | 'textarea' | 'select' | 'email' | 'tel' | 'password';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormField<T extends FieldValues = any> {
  name: Path<T>;            // Nome exato do campo no formulário/payload (ex.: 'veiculo_id')
  label: string;           // Texto de cabeçalho visível para o usuário
  type: FieldType;
  required?: boolean;      // Define se o preenchimento é obrigatório para salvar
  readOnly?: boolean;      // Impede a edição, mas o campo ainda é submetido no payload
  disabled?: boolean;      // Desabilita totalmente a interação (geralmente fica acinzentado)
  placeholder?: string;    // Texto de dica exibido quando o input está vazio
  colSpan?: 1 | 2 | 3;     // Largura do campo na grade visual (3 = ocupa a linha inteira)
  endpoint?: string;       // Endpoint que fornece { value, label } para o select
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormSchema<T extends FieldValues = any> {
  fields: FormField<T>[]
}
