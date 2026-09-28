import React, { useState, useEffect } from "react";
import { usuarioApi } from "../../domains/sistema/usuarios/usuarios.api";
import type { Usuario } from "../types/models";
import { AuthContext } from "./authContext";
import { isAuthenticated, clearAuthTokens } from "./auth.utils";
import { getApiErrorMessage } from "../api/errorHandlers";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async (throwOnError = false) => {
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
      console.error("Erro ao buscar dados do usuário", getApiErrorMessage(error));
      clearAuthTokens();
      setUser(null);
      if (throwOnError) throw error;
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
