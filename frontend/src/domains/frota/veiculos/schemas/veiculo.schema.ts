import type { FormSchema, TableSchema } from "../../../../core/types/form";
import { ENDPOINTS } from "../../../../core/api/endpoints";
import { MASKS } from "../../../../core/utils/masks";
import type { ViewSchema } from "../../../../core/types/views";
import type { VeiculoReadDTO } from "./veiculo.read.zod";
import type { VeiculoFormData } from "./veiculo.form.zod";

export const veiculoUISchema: FormSchema = {
  fields: [
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: [
        { value: 'CARRO', label: 'Carro' },
        { value: 'CAMINHONETE', label: 'Caminhonete' },
        { value: 'ONIBUS', label: 'Ônibus' },
        { value: 'MOTO', label: 'Moto' },
        { value: 'VAN', label: 'Van' },
        { value: 'MAQUINA_PESADA', label: 'Máquina Pesada/Trator' }
      ],
      colSpan: 1,
      required: true,
    },
    {
      name: "modelo",
      label: "Modelo",
      type: "text",
      placeholder: "Ex: Toyota Hilux",
      colSpan: 2,
      required: true,
    },
    {
      name: "placa",
      label: "Placa",
      type: "text",
      mask: MASKS.PLACA,
      placeholder: "ABC-1234",
      colSpan: 1,
      required: true,
    },
    {
      name: "tipo_combustivel_id",
      label: "Combustível",
      type: "select",
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      colSpan: 2,
      required: true,
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
      required: true,
    },
    {
      name: "consumo_estimado_combustivel",
      label: "Consumo Estim. Combustível",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: "Litros",
      placeholder: '0,00',
      colSpan: 1,
    },
    {
      name: "consumo_estimado_oleo",
      label: "Consumo Estim. Óleo",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: "Litros",
      placeholder: '0,00',
      colSpan: 1,
      // Exibe consumo de óleo predominantemente para máquinas pesadas
      visibleIf: (values: Partial<VeiculoFormData>) => values.categoria === 'MAQUINA_PESADA',
    },
    {
      name: "hodometro_atual",
      label: "Hodômetro / Horímetro Atual",
      type: "text",
      mask: MASKS.DECIMAL,
      placeholder: '0,0',
      colSpan: 1,
      required: true,
    },
    {
      name: "capacidade_carga_kg",
      label: "Capacidade Carga (Kg)",
      type: "text",
      mask: MASKS.DECIMAL,
      suffix: "kg",
      placeholder: '0,00',
      colSpan: 1,
    },
    {
      name: "capacidade_pessoas",
      label: "Capacidade Pessoas",
      type: "text", // Usamos text aqui por conta do IMask
      mask: MASKS.INTEIRO,
      placeholder: '0',
      colSpan: 1,
    },
    {
      name: "ativo",
      label: "Veículo Ativo (Disponível para uso)",
      type: "checkbox",
      colSpan: 3,
      required: false,
    }
  ]
};

export const veiculoListSchema: TableSchema = {
  columns: [
    { key: "placa", label: "Placa", sortKey: "placa", format: (v) => v || '-' },
    { key: "modelo", label: "Modelo", sortKey: "modelo" },
    { key: "categoria_nome", label: "Categoria", sortKey: "categoria" },
    { key: "tipo_combustivel_nome", label: "Combustível" }, // ForeignKey não entra no sortKey padrão se não mapeado
    { 
      key: "ativo", 
      label: "Status", 
      sortKey: "ativo",
      format: (val: boolean) => val ? '✅ Ativo' : '❌ Inativo'
    }
  ]
};

export const veiculoViewSchema: ViewSchema<VeiculoReadDTO> = {
  title: (item) => `Veículo #${item.id}`,
  fields: [
    { label: 'Modelo', key: 'modelo', fullWidth: true },
    { label: 'Placa', key: 'placa' },
    { label: 'Categoria', key: 'categoria_nome' },
    { 
      label: 'Hodômetro / Horímetro', 
      render: (item) => `${item.hodometro_atual} ${item.unidade_consumo === 'L_POR_H' ? 'Horas' : 'km'}` 
    },
    { 
      label: 'Consumo Médio (Combustível)', 
      render: (item) => item.consumo_estimado_combustivel ? `${item.consumo_estimado_combustivel} ${item.unidade_consumo_nome}` : '-' 
    },
    { 
      label: 'Consumo Médio (Óleo)', 
      render: (item) => item.consumo_estimado_oleo ? `${item.consumo_estimado_oleo} Litros` : '-' 
    },
    { label: 'Ativo', render: (item) => `${item.ativo ? 'Sim' : 'Não'}` },
  ]
};