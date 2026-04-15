import type { FormSchema, TableSchema } from "../types/form";
import { ENDPOINTS } from "../api/config/endpoints";
import type { ViewSchema } from "../types/views";
import type { OperadorVeiculo } from "../types/models";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const operadorFormSchema: FormSchema = {
  fields: [
    {
      name: "pessoa_id",
      label: "Motorista / Operador",
      type: "select",
      endpoint: ENDPOINTS.pessoas.lookup, 
      colSpan: 3,
      required: true,
    },
    {
      name: "veiculo_id",
      label: "Veículo",
      type: "select",
      endpoint: ENDPOINTS.frota.veiculosLookup, 
      colSpan: 3,
      required: true,
    },
    {
      name: "is_principal",
      label: "⭐ É o motorista titular (principal) deste veículo?",
      type: "checkbox",
      colSpan: 3,
      required: false,
    },
  ],
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const operadorListSchema: TableSchema = {
  columns: [
    {
      key: "pessoa_nome",
      label: "Motorista",
      sortKey: "pessoa__nome",
    },
    {
      key: "veiculo_placa",
      label: "Placa",
      sortKey: "veiculo__placa",
    },
    {
      key: "veiculo_modelo",
      label: "Veículo",
      sortKey: "veiculo__modelo",
    },
    {
      key: "is_principal",
      label: "Status",
      sortKey: "is_principal",
      format: (val: boolean) => val ? '⭐ Titular' : 'Reserva / Secundário',
    },
  ],
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const operadorViewSchema: ViewSchema<OperadorVeiculo> = {
  title: (item) => `Operador de Veículo #${item.id}`,
  fields: [
    { label: 'Motorista/Operador', key: 'pessoa_nome' },
    { label: 'Veículo', render: (item) => `${item.veiculo_modelo} - ${item.veiculo_placa}` },
    { label: 'Status', render: (item) => `${item.is_principal ? '⭐ Titular' : 'Reserva / Secundário'}` },
  ]
};