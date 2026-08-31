// src/components/RequirePermission.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../useAuth";
import type { Usuario } from "../../types/models";

type Props = {
  allow?: (me: Usuario) => boolean;
  children: React.ReactElement;
};

export function RequirePermission({ allow, children }: Props) {
  const { user, isLoading } = useAuth(); // Pega da memória instantaneamente!

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <span>Carregando aplicação...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow(user)) {
    // Redireciona para home se não tiver permissão
    return <Navigate to="/home" replace />; 
  }

  return children;
}