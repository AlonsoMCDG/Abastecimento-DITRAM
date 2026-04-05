import React, { createContext, useContext, useState, useEffect } from "react";
import { usuarioApi } from "../api/usuarios/usuariosApi";
import type { Usuario } from "../types/models";
import { isAuthenticated, clearAuthTokens } from "./auth";

// Tipagem do que o nosso contexto vai fornecer para o resto do app
interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  logout: () => void;
  // Função para forçar o recarregamento (útil logo após o usuário fazer login na tela de login)
  refreshUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

// Hook customizado para facilitar o uso nos outros arquivos
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}