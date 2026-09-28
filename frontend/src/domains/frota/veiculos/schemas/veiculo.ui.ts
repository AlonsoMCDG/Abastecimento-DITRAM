import { ENDPOINTS } from "../../../../core/api/endpoints";
import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { ViewSchema } from "../../../../core/types/views";
import type { VeiculoFormInput } from "./veiculo.form";
import type { VeiculoReadDTO } from "./veiculo.dto";


// --------------------------------------------------------
// FORMULÁRIO (UI SCHEMA)
// --------------------------------------------------------

export const veiculoUISchema: FormSchema<VeiculoFormInput> = {
  fields: [
    // -------------------------
    // IDENTIFICAÇÃO
    // -------------------------
    {
      name: "modelo",
      label: "Modelo",
      type: "text",
      required: true,
      placeholder: "Ex.: Gol, Hilux, Sprinter...",
    },

    {
      name: "placa",
      label: "Placa",
      type: "text",
      required: true,
      placeholder: "ABC-1234",
    },

    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      required: true,
      // Fonte única de verdade: choices do model Veiculo no backend
      endpoint: ENDPOINTS.choices.veiculoCategoria,
    },

    // -------------------------
    // COMBUSTÍVEL
    // -------------------------
    {
      name: "tipo_combustivel_id",
      label: "Tipo de Combustível",
      type: "select",
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      required: true,
    },

    {
      name: "unidade_consumo",
      label: "Unidade de Consumo",
      type: "select",
      required: true,
      // Fonte única de verdade: choices do model Veiculo no backend
      endpoint: ENDPOINTS.choices.veiculoUnidadeConsumo,
    },

    // -------------------------
    // HODÔMETRO
    // -------------------------
    {
      name: "hodometro_atual",
      label: "Hodômetro Atual",
      type: "number",
      suffix: "km",
    },

    // -------------------------
    // CONSUMO ESTIMADO
    // -------------------------
    {
      name: "consumo_estimado_combustivel",
      label: "Consumo Estimado de Combustível",
      type: "number",
      suffix: "km/L ou L/h",
    },

    {
      name: "consumo_estimado_oleo",
      label: "Consumo Estimado de Óleo",
      type: "number",
      suffix: "L",
    },

    // -------------------------
    // CAPACIDADE
    // -------------------------
    {
      name: "capacidade_carga_kg",
      label: "Capacidade de Carga",
      type: "number",
      suffix: "kg",
    },

    {
      name: "capacidade_pessoas",
      label: "Capacidade de Pessoas",
      type: "number",
      suffix: "pessoas",
    },

    // -------------------------
    // STATUS
    // -------------------------
    {
      name: "ativo",
      label: "Veículo ativo",
      type: "checkbox",
    },
  ],
};


// --------------------------------------------------------
// DATATABLE
// --------------------------------------------------------

export const veiculoListSchema: TableSchema = {
  columns: [
    {
      key: "placa",
      label: "Placa",
      sortKey: "placa",
    },

    {
      key: "modelo",
      label: "Modelo",
      sortKey: "modelo",
    },

    {
      key: "categoria_nome",
      label: "Categoria",
      sortKey: "categoria",
    },

    {
      key: "tipo_combustivel_nome",
      label: "Combustível",
      sortKey: "tipo_combustivel__nome",
    },

    {
      key: "hodometro_atual",
      label: "Hodômetro",
      format: (val) =>
        val !== null && val !== undefined
          ? `${val} km`
          : "-",
    },

    {
      key: "ativo",
      label: "Status",
      format: (val) =>
        val ? "Ativo" : "Inativo",
    },
  ],
};


// --------------------------------------------------------
// VIEW (MODAL)
// --------------------------------------------------------

export const veiculoViewSchema:
  ViewSchema<VeiculoReadDTO> = {
  title: (item) =>
    `${item.modelo} - ${item.placa}`,

  subtitle: (item) =>
    item.ativo ? "Veículo ativo" : "Veículo inativo",

  fields: [
    {
      label: "Modelo",
      key: "modelo",
    },

    {
      label: "Placa",
      key: "placa",
    },

    {
      label: "Categoria",
      key: "categoria_nome",
    },

    {
      label: "Tipo de Combustível",
      key: "tipo_combustivel_nome",
    },

    {
      label: "Unidade de Consumo",
      key: "unidade_consumo_nome",
    },

    {
      label: "Hodômetro Atual",
      render: (item) =>
        `${item.hodometro_atual} km`,
    },

    {
      label: "Consumo Estimado de Combustível",
      render: (item) =>
        item.consumo_estimado_combustivel != null
          ? `${item.consumo_estimado_combustivel} ${item.unidade_consumo === "KM_POR_L" ? "km/L" : "L/h"}`
          : "-",
    },

    {
      label: "Consumo Estimado de Óleo",
      render: (item) =>
        item.consumo_estimado_oleo != null
          ? `${item.consumo_estimado_oleo} L`
          : "-",
    },

    {
      label: "Capacidade de Carga",
      render: (item) =>
        item.capacidade_carga_kg != null
          ? `${item.capacidade_carga_kg} kg`
          : "-",
    },

    {
      label: "Capacidade de Pessoas",
      render: (item) =>
        item.capacidade_pessoas != null
          ? `${item.capacidade_pessoas} pessoas`
          : "-",
    },

    {
      label: "Status",
      render: (item) =>
        item.ativo ? "Ativo" : "Inativo",
    },
  ],
};