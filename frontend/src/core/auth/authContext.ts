import { createContext } from "react";
import type { Usuario } from "../types/models";

// Tipagem do que o nosso contexto vai fornecer para o resto do app
export interface AuthContextType {
  user: Usuario | null;
  isLoading: boolean;
  logout: () => void;
  // Função para forçar o recarregamento (útil logo após o usuário fazer login na tela de login)
  refreshUser: () => Promise<void>;
}

// Contexto em arquivo próprio para que o AuthProvider (componente) e o
// useAuth (hook) vivam em módulos separados — exigência do React Fast
// Refresh (react-refresh/only-export-components).
export const AuthContext = createContext<AuthContextType | undefined>(undefined);