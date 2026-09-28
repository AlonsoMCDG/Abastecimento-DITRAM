import React from "react";

type Props = {
  action?: string;
  children: React.ReactNode;
};

/**
 * Mantido por compatibilidade com as telas existentes.
 * A aplicação possui um único usuário operacional; a autorização
 * administrativa real permanece somente na rota do banco de dados.
 */
export function Can({ children }: Props) {
  return <>{children}</>;
}
