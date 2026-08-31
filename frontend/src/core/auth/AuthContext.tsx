import React, { useState, useEffect } from "react";
import { usuarioApi } from "../../domains/sistema/usuarios/usuarios.api";
import type { Usuario } from "../types/models";
import { AuthContext } from "./authContext";
import { isAuthenticated, clearAuthTokens } from "./auth.utils";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await usuarioApi.me();
      setUser(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados do usuário", error);
      clearAuthTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Roda uma única vez quando a aplicação é aberta
  useEffect(() => {
    refreshUser();
  }, []);

  const logout = () => {
    clearAuthTokens();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}