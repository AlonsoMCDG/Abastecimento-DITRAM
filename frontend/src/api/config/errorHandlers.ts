import axios from "axios";

// Utilitário para formatar valores de erro do DRF (geralmente arrays de strings)
function stringifyValue(value: unknown): string {
  if (value == null || value == undefined) return ""; 
  if (Array.isArray(value)) return value.map(stringifyValue).join(", ");
  if (typeof value === "string") return value;
  
  // DRF pode retornar erros aninhados. Ex: perfil: { idade: ["Obrigatória"] }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(stringifyValue)
      .filter(Boolean)
      .join(", ");
  }
  
  return String(value);
}

export function getApiErrorMessage(err: unknown, fallback: string = "Ocorreu um erro inesperado."): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : fallback;
  }

  // 1. Erro de Rede (Servidor fora do ar, CORS, ou IP errado)
  if (!err.response) {
    // Captura o motivo exato da falha gerado pelo navegador/Axios
    const axiosMessage = err.message || "Erro de rede desconhecido";
    const axiosCode = err.code ? ` [${err.code}]` : "";
    const erroReal = `${axiosMessage}${axiosCode}`;

    // DEBUG PARA DESENVOLVIMENTO
    if (import.meta.env.DEV) {
      return `Falha na requisição: ${erroReal}\n(Dev Info: Se for "Network Error", abra o Console do navegador (F12) e procure por bloqueios de CORS. Caso contrário, verifique se o servidor em ${import.meta.env.VITE_API_URL} está rodando e acessível na mesma rede.)`;
    }
    
    // MENSAGEM PARA PRODUÇÃO
    return `Não foi possível conectar ao servidor. Detalhe técnico: ${erroReal}. Verifique sua conexão com a internet.`;
  }

  const status = err.response.status;
  const data = err.response.data as unknown;

  // 2. Bloqueio imediato apenas para HTML (Ex: Página amarela de erro do Django ou Nginx 502)
  if (typeof data === "string" && /<html/i.test(data)) {
    return "Erro interno no servidor. Nossa equipe já foi notificada. Tente novamente mais tarde.";
  }

  // 3. Tratamento de Erros de Validação do Django REST Framework (DRF) e Erros Customizados
  // Movido para cima! Ele intercepta nossos erros 400 e os 500 customizados antes do fallback genérico.
  if (data && typeof data === "object") {
    const anyData = data as Record<string, unknown>;

    // Padrão de exceção explícita do DRF (ex: Autenticação falhou ou nosso {"detail": "..."})
    if (typeof anyData.detail === "string") {
      return anyData.detail;
    }

    // Tratamento especial para regras de validação globais do Model (unique_together, etc)
    if (anyData.non_field_errors) {
      return stringifyValue(anyData.non_field_errors);
    }

    // Erros atrelados a campos específicos do formulário
    const parts: string[] = [];
    for (const [key, value] of Object.entries(anyData)) {
      const msg = stringifyValue(value).trim();
      if (msg) {
        // Formata a chave: "first_name" -> "First Name"
        const humanKey = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        parts.push(`${humanKey}: ${msg}`);
      }
    }
    
    if (parts.length > 0) {
      return parts.join("\n");
    }
  }

  // 4. Erros críticos do servidor (500+) não tratados
  // Se passou pelo bloco de JSON e chegou aqui sendo 500+, exibe a mensagem genérica
  if (status >= 500) {
    return "Erro interno no servidor. Nossa equipe já foi notificada. Tente novamente mais tarde.";
  }

  // 5. Se a resposta for apenas uma string de erro simples (não HTML)
  if (typeof data === "string") {
    return data.trim() || fallback;
  }

  return fallback;
}