import { useContext } from "react";
import { AuthContext } from "./authContext";

// Hook customizado para facilitar o uso nos outros arquivos
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}