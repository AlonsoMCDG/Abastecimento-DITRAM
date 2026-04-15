import type { ReactNode } from "react";

export interface ViewField<T> {
  label: string;
  // A chave deve ser estritamente uma das propriedades do objeto T (ou opcional se usar o render)
  key?: keyof T;
  // Opcional: Renderizador customizado (passa o objeto inteiro)
  render?: (item: T) => ReactNode;
  // Opcional: Para fazer um campo ocupar a linha inteira na grid
  fullWidth?: boolean; 
}

export interface ViewSchema<T> {
  // Funções que recebem o item para gerar o cabeçalho dinamicamente
  title: (item: T) => string;
  subtitle?: (item: T) => string;
  fields: ViewField<T>[];
}