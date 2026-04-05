import React from "react";
import { useAuth } from "../../auth/AuthContext";

type PermissionKeys = 
  | "is_staff" 
  | "is_superuser" 
  | "can_write_cadastros" 
  | "can_write_frota" 
  | "can_create_guia_abastecimento" 
  | "can_edit_guia_abastecimento" 
  | "can_delete_guia_abastecimento";

type Props = {
  action: PermissionKeys;
  children: React.ReactNode;
};

export function Can({ action, children }: Props) {
  const { user } = useAuth();

  if (!user) return null;

  // Se for staff ou superuser, sempre libera.
  // Caso contrário, checa a permissão específica.
  const hasAccess = user.is_staff || user.is_superuser || user[action];

  if (!hasAccess) return null;

  // Se tiver permissão, mostra o botão/componente
  return <>{children}</>;
}