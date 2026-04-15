import { ENDPOINTS } from "../api/config/endpoints"
import type { GuiaCreatePayload } from "../api/operacao/guiasApi"
import { TIPO_SERVICO_BARQUEIRO_ID } from "../constants/operacao"
import type { FormSchema, TableSchema } from "../types/form"
import type { GuiaAbastecimento } from "../types/models"
import type { ViewSchema } from "../types/views"
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
      endpoint: ENDPOINTS.frota.tiposVeiculoLookup,
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
      visibleIf: (values: Partial<GuiaCreatePayload>) => values.tipo_servico_id == TIPO_SERVICO_BARQUEIRO_ID,
    },
    {
      name: 'periodo_uso_dias',
      label: 'Período de Uso',
      type: 'number',
      suffix: 'dias',
      placeholder: 'Ex: 30',
      colSpan: 1,
      required: false,
      visibleIf: (values: Partial<GuiaCreatePayload>) => values.tipo_servico_id == TIPO_SERVICO_BARQUEIRO_ID,
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
// DATATABLE (LISTAGEM)
// --------------------------------------------------------

export const guiaAbastecimentoListSchema: TableSchema = {
  columns: [
    {
      key: 'data_hora',
      label: 'Data',
      format: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'tipo_servico_nome', 
      label: 'Serviço',
      sortKey: 'tipo_servico__nome',
    },
    {
      key: 'pessoa_nome',
      label: 'Motorista',
      sortKey: 'pessoa__nome',
    },
    {
      key: 'secretaria_sigla',
      label: 'Secretaria',
      sortKey: 'secretaria__sigla'
    },
    {
      key: 'quantidade_combustivel',
      label: 'Combustível (L)',
      format: (val) => val ? `${val} L` : '-',
      sortKey: 'quantidade_combustivel',
    }
  ],
}

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const guiaViewSchema: ViewSchema<GuiaAbastecimento> = {
  title: (item) => `Guia de Abastecimento #${item.id}`,
  subtitle: (item) => {
    const dataFormatada = new Date(item.data_hora).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `Emitida em: ${dataFormatada.replace(',', ' às')}`;
  },
  fields: [
    { label: 'Veículo', key: 'veiculo_placa' },
    { label: 'Motorista', key: 'pessoa_nome' },
    { 
      label: 'Combustível', 
      // Usando o render para formatar dados compostos
      render: (item) => `${item.quantidade_combustivel} Litros (${item.tipo_combustivel_nome})` 
    },
    { 
      label: 'Óleo Lubrificante', 
      // Usando o render para formatar dados compostos
      render: (item) => `${item.quantidade_oleo} Litros` 
    },
    // { label: 'Status', key: 'status' },
    { 
      label: 'Observações', 
      key: 'observacao', 
      fullWidth: true // Exemplo: Faz a observação ocupar a linha toda da grid
    }
  ]
};