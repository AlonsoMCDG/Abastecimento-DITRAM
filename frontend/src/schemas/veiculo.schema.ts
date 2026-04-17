import type { FormSchema, TableSchema } from "../types/form";
import { ENDPOINTS } from "../api/config/endpoints";
import { MASKS } from "../utils/masks";
import type { ViewSchema } from "../types/views";
import type { Veiculo } from "../types/models";
import type { VeiculoCreatePayload } from "../api/frota/veiculosApi"
import { TIPO_VEICULO_BARCO_ID } from "../constants/constants";

// --------------------------------------------------------
// FORMULÁRIO
// --------------------------------------------------------
export const veiculoFormSchema: FormSchema = {
  fields: [
    {
      name: "tipo_veiculo_id",
      label: "Tipo de Veículo",
      type: "select",
      endpoint: ENDPOINTS.frota.tiposVeiculoLookup,
      colSpan: 1,
      required: true
    },
    {
      name: "modelo",
      label: "Modelo",
      type: "text",
      placeholder: "Ex: Toyota Hilux",
      colSpan: 1,
      required: true
    },
    {
      name: "placa",
      label: "Placa",
      type: "text",
      placeholder: "ABC1234",
      visibleIf: (values: Partial<VeiculoCreatePayload>) => values.tipo_veiculo_id != TIPO_VEICULO_BARCO_ID,
      colSpan: 1,
    },
    {
      name: "secretaria_id",
      label: "Secretaria Vinculada",
      type: "select",
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      colSpan: 3,
      required: true
    },
    {
      name: "tipo_locomocao",
      label: "Tipo de Locomoção",
      type: "select",
      options: [
        { value: "TERRESTRE", label: "Terrestre" },
        { value: "FLUVIAL", label: "Fluvial" }
      ],
      colSpan: 1,
      required: true
    },
    {
      name: "tipo_combustivel_id",
      label: "Combustível",
      type: "select",
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      colSpan: 1,
      required: true
    },
    {
      name: "unidade_consumo",
      label: "Unidade de Consumo",
      type: "select",
      options: [
        { value: "KM_POR_L", label: "km/L" },
        { value: "L_POR_H", label: "L/h" }
      ],
      colSpan: 1,
    },
    {
      name: "consumo_estimado_combustivel",
      label: "Consumo Estim. Combustível",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: "Litros",
      placeholder: '0,0',
      colSpan: 1,
    },
    {
      name: "consumo_estimado_oleo",
      label: "Consumo Estim. Óleo",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: "Litros",
      placeholder: '0,0',
      colSpan: 1,
      visibleIf: (values: Partial<VeiculoCreatePayload>) => values.tipo_veiculo_id == TIPO_VEICULO_BARCO_ID,
      required: false
    },
    {
      name: "hodometro_atual",
      label: "Hodômetro / Horímetro Atual",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: 'km',
      placeholder: '0,0',
      colSpan: 1,
      required: true
    },
    {
      name: "capacidade_carga_kg",
      label: "Capacidade Carga (Kg)",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: "kg",
      placeholder: '0,0',
      colSpan: 1,
    },
    {
      name: "capacidade_pessoas",
      label: "Capacidade Pessoas",
      type: "number",
      colSpan: 1,
      placeholder: '0',
    },
    {
      name: "ativo",
      label: "Veículo Ativo (Disponível para uso)",
      type: "checkbox",
      colSpan: 3,
      required: false
    }
  ]
};

// --------------------------------------------------------
// DATATABLE
// --------------------------------------------------------
export const veiculoListSchema: TableSchema = {
  columns: [
    { key: "placa", label: "Placa", sortKey: "placa" },
    { key: "modelo", label: "Modelo", sortKey: "modelo" },
    { key: "tipo_veiculo_nome", label: "Tipo", sortKey: "tipo_veiculo__nome" },
    { key: "secretaria_sigla", label: "Secretaria", sortKey: "secretaria__sigla" },
    { key: "tipo_combustivel_nome", label: "Combustível", sortKey: "tipo_combustivel__nome" },
    { 
      key: "ativo", 
      label: "Status", 
      sortKey: "ativo",
      format: (val: boolean) => val ? '✅ Ativo' : '❌ Inativo'
    }
  ]
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const veiculoViewSchema: ViewSchema<Veiculo> = {
  title: (item) => `Veículo #${item.id}`,
  fields: [
    { label: 'Modelo', key: 'modelo' },
    { label: 'Placa', key: 'placa' },
    { 
      label: 'Hodômetro Atual', 
      render: (item) => `${item.hodometro_atual} km` 
    },
    { 
      label: 'Consumo Médio de Combustível', 
      render: (item) => `${item.consumo_estimado_combustivel} Litros` 
    },
    { 
      label: 'Consumo Médio de Óleo', 
      render: (item) => `${item.consumo_estimado_oleo} Litros` 
    },
    { label: 'Ativo', render: (item) => `${item.ativo ? 'Sim' : 'Não'}` },
  ]
};