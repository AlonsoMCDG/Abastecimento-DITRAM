import type { FormSchema, TableSchema } from "../types/form"
import { ENDPOINTS } from "../api/config/endpoints"
import { MASKS } from "../utils/masks"

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO (DynamicForm)
// --------------------------------------------------------
export const guiaAbastecimentoFormSchema: FormSchema = {
  fields: [
    {
      name: 'secretaria_id',
      label: 'Secretaria',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      colSpan: 1,
      required: true
    },
    {
      name: 'tipo_servico_id',
      label: 'Tipo de Serviço',
      type: 'select',
      endpoint: ENDPOINTS.operacao.tiposServicoLookup,
      colSpan: 1,
      required: true,
    },
    {
      name: 'data_hora',
      label: 'Data e Hora',
      type: "datetime-local",
      colSpan: 1,
      required: false,
    },
    {
      name: 'pessoa_id',
      label: 'Motorista',
      type: 'select',
      endpoint: ENDPOINTS.operacao.alocacoesServicoLookup,
      dependsOn: 'secretaria_id',
      dependsOnParam: 'secretaria_id',
      colSpan: 1,
      required: true,
      quickActions: [
        {
          icon: '➕',
          tooltip: 'Cadastrar novo Motorista',
          onClick: () => console.log('Abrir modal de Motorista!'), // Será sobrescrito na página se necessário
        }
      ]
    },
    {
      name: 'veiculo_id',
      label: 'Veículo',
      type: 'datalist',
      endpoint: ENDPOINTS.frota.veiculosLookup,
      placeholder: 'Ex.: Hilux SR AT - 123ABCD',
      colSpan: 1,
      required: true,
    },
    {
      name: 'tipo_veiculo_id',
      label: 'Tipo de Veículo',
      type: 'datalist',
      endpoint: ENDPOINTS.frota.tiposveiculoLookup,
      placeholder: 'Ex.: "Ônibus" ou "Moto"',
      colSpan: 1,
      required: true,
    },
    {
      name: 'rota_id',
      label: 'Rota de Destino',
      type: 'datalist',
      endpoint: ENDPOINTS.frota.rotasLookup,
      placeholder: 'Selecione ou digite uma nova rota...',
      colSpan: 3,
      required: true,
    },
    {
      name: 'instituicao_id',
      label: 'Instituição / Local',
      type: 'datalist',
      endpoint: ENDPOINTS.organizacao.instituicoesLookup,
      placeholder: 'Selecione uma instituição...',
      colSpan: 3,
      required: true,
    },
    {
      name: 'hodometro_atual',
      label: 'Hodômetro (Km)',
      type: 'text',
      suffix: 'km',
      placeholder: '0,00',
      colSpan: 1,
      required: true,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'hodometro_anterior',
      label: 'Hodômetro Anterior (Km)',
      type: 'text',
      suffix: 'km',
      placeholder: '0,00',
      colSpan: 1,
      readOnly: true,
      required: false,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'distancia_percorrida',
      label: 'Distância Percorrida',
      type: 'text',
      suffix: 'km',
      placeholder: '0,00',
      colSpan: 1,
      readOnly: true,
      required: false,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'rota_distancia_km',
      label: 'Distância da Rota Oculta',
      type: 'hidden',
    },
    {
      name: 'quantidade_combustivel',
      label: 'Qtd. Combustível (L)',
      type: 'text',
      suffix: 'Litros',
      placeholder: '0,0',
      colSpan: 1,
      required: true,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'rota_consumo_combustivel',
      label: 'Consumo Estimado de Combustível',
      type: 'hidden',
    },
    {
      name: 'tipo_combustivel_id',
      label: 'Tipo de Combustível',
      type: 'select',
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      colSpan: 1,
      required: true,
    },
    {
      name: 'rota_consumo_oleo',
      label: 'Consumo Estimado de Óleo',
      type: 'hidden',
    },
    {
      name: 'quantidade_oleo',
      label: 'Qtd. Óleo Lubrificante (L)',
      type: 'text',
      suffix: 'Litros',
      placeholder: '0,0',
      colSpan: 1,
      required: true,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'observacao',
      label: 'Observação',
      type: 'textarea',
      colSpan: 1,
      required: false,
    },
  ]
}

// --------------------------------------------------------
// DATATABLE (LISTAGEM) - FOCO NO ESSENCIAL
// --------------------------------------------------------

export const guiaAbastecimentoListSchema: TableSchema = {
  columns: [
    {
      key: "data_hora",
      label: "Data",
      // Função nativa do TableSchema para formatar o valor na tela
      format: (val) => val ? new Date(val).toLocaleDateString("pt-BR") : "-",
    },
    {
      // O backend deve enviar esse campo preenchido (ou você pode mapear caso ele venha aninhado)
      key: "veiculo_placa", 
      label: "Veículo",
    },
    {
      key: "pessoa_nome",
      label: "Motorista",
    },
    {
      key: "secretaria_sigla",
      label: "Secretaria",
    },
    {
      key: "quantidade_combustivel",
      label: "Combustível (L)",
      format: (val) => val ? `${val} L` : "-",
    }
  ],
}

