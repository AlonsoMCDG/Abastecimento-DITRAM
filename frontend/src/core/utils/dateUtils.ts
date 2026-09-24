/**
 * Utilitários para manipulação e formatação de datas e fusos horários locais.
 */

/**
 * Retorna a data atual no formato ISO local: "YYYY-MM-DD"
 */
export function getTodayLocalISO(): string {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzoffset).toISOString().split("T")[0];
}

/**
 * Retorna a data e hora atual no formato para inputs do tipo datetime-local: "YYYY-MM-DDTHH:MM"
 */
export function getCurrentDateTimeLocalISO(): string {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
}

/**
 * Retorna o primeiro dia do mês atual no formato: "YYYY-MM-01"
 */
export function getFirstDayOfMonthISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/**
 * Formata uma string de data (YYYY-MM-DD) para exibição brasileira: "DD/MM/YYYY"
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return "-";
  const parts = dateStr.split("T")[0].split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

/**
 * Formata uma string ISO ou Date para data e hora brasileira: "DD/MM/YYYY HH:mm"
 */
export function formatDateTimeBR(dateValue?: string | Date | null): string {
  if (!dateValue) return "-";
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}
