import type { FormSchema, TableSchema } from "../types/form"
import { ENDPOINTS } from "../api/config/endpoints"

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
      name: 'motorista_id',
      label: 'Motorista',
      type: 'select',
      endpoint: ENDPOINTS.pessoas.lookup,
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
      type: 'select',
      endpoint: ENDPOINTS.frota.veiculosLookup,
      dependsOn: 'motorista_id',
      dependsOnParam: 'motorista_id',
      colSpan: 1,
      required: true,
    },
    {
      name: 'rota',
      label: 'Rota de Destino',
      type: 'datalist',
      endpoint: ENDPOINTS.frota.rotasLookup,
      dependsOn: 'secretaria_id',
      dependsOnParam: 'secretaria_id',
      placeholder: 'Selecione ou digite uma nova rota...',
      colSpan: 2,
      required: true,
    },
    {
      name: 'instituicao',
      label: 'Instituição / Local',
      type: 'datalist',
      endpoint: ENDPOINTS.organizacao.instituicoesLookup,
      dependsOn: 'secretaria_id',
      dependsOnParam: 'secretaria_id',
      placeholder: 'Selecione uma instituição...',
      colSpan: 2,
      required: true,
    },
    {
      name: 'hodometro_anterior',
      label: 'Hodômetro Anterior (Km)',
      type: 'number',
      colSpan: 1,
      required: true,
    },
    {
      name: 'quantidade_combustivel',
      label: 'Qtd. Combustível (L)',
      type: 'number',
      suffix: 'Litros',
      colSpan: 1,
      required: true,
    },
    {
      name: 'combustivel_id',
      label: 'Tipo de Combustível',
      type: 'select',
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      dependsOn: 'veiculo_id',
      dependsOnParam: 'veiculo_id',
      colSpan: 1,
      required: true,
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

