import axios from "axios";

function stringifyValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(stringifyValue).join(", ");
  if (typeof value === "string") return value;
  if (value == null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value); // Previne a exibição "[object Object]"
  return String(value);
}

export function getApiErrorMessage(err: unknown, fallback: string = "Ocorreu um erro inesperado."): string {
  if (!axios.isAxiosError(err)) {
    return err instanceof Error ? err.message : fallback;
  }

  // Proteção para HTML do Django em erros de servidor (500+)
  if (err.response?.status && err.response.status >= 500) {
    return "Erro interno no servidor. Tente novamente mais tarde.";
  }

  const data = err.response?.data as unknown;
  if (!data) return fallback;

  // Proteção para strings puras (só retorna se for um erro curto, não um HTML)
  if (typeof data === "string") {
    return data.includes("<html") ? "Erro interno no servidor." : data;
  }

  if (typeof data === "object" && data !== null) {
    const anyData = data as Record<string, unknown>;

    // Padrão de exceção explícita do DRF
    if (typeof anyData.detail === "string") return anyData.detail;

    // Tratamento especial para regras de validação do Model (unique_together, etc)
    if (anyData.non_field_errors) {
        return stringifyValue(anyData.non_field_errors);
    }

    const parts: string[] = [];
    for (const [key, value] of Object.entries(anyData)) {
      const msg = stringifyValue(value).trim();
      if (msg) {
        const humanKey = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
        parts.push(`${humanKey}: ${msg}`);
      }
    }
    if (parts.length) return parts.join("\n");
  }

  return fallback;
}

