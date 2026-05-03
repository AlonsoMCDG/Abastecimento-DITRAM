import { ENDPOINTS } from "../../../../core/api/endpoints"
import type { FormSchema, TableSchema } from "../../../../core/types/form"
import type { ViewSchema } from "../../../../core/types/views"
import type { GuiaAbastecimentoReadDTO } from "./guia.read.zod"

// --------------------------------------------------------
// FORMULÁRIO
// --------------------------------------------------------
export const guiaAbastecimentoFormSchema: FormSchema = {
  fields: [
    {
      name: 'secretaria_id',
      label: 'Secretaria',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      required: true,
    },
    {
      name: 'tipo_atividade',
      label: 'Serviço',
      type: 'select',
      endpoint: ENDPOINTS.operacao.tiposAtividadeLookup,
      required: true,
      creatable: true
    },
    {
      name: 'data_hora',
      label: 'Data e Hora',
      type: "datetime-local",
    },
    {
      name: 'pessoa_id',
      label: 'Motorista',
      type: 'select',
      endpoint: ENDPOINTS.pessoas.lookup,
      required: true,
    },

    // -------------------------
    // VEÍCULO (XOR)
    // -------------------------
    {
      name: 'veiculo_id',
      label: 'Veículo',
      type: 'select',
      endpoint: ENDPOINTS.frota.veiculosLookup,
    },
    {
      name: 'categoria',
      label: 'Tipo de Veículo',
      type: 'select',
      options: [
        { label: 'Carro', value: 'CARRO' },
        { label: 'Caminhonete', value: 'CAMINHONETE' },
        { label: 'Ônibus', value: 'ONIBUS' },
        { label: 'Moto', value: 'MOTO' },
        { label: 'Van', value: 'VAN' },
        { label: 'Barco', value: 'BARCO' },
        { label: 'Máquina Pesada', value: 'MAQUINA_PESADA' },
      ]
    },
    {
      name: 'veiculo_descricao',
      label: 'Descrição do Veículo',
      type: 'text',
    },

    // -------------------------
    // ROTA
    // -------------------------
    {
      name: 'rota_id',
      label: 'Rota',
      type: 'select',
      endpoint: ENDPOINTS.frota.rotasLookup,
    },
    {
      name: 'rota_manual',
      label: 'Rota Manual',
      type: 'text',
    },

    // -------------------------
    // INSTITUIÇÃO
    // -------------------------
    {
      name: 'instituicao_id',
      label: 'Instituição',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.instituicoesLookup,
    },

    // -------------------------
    // COMBUSTÍVEL
    // -------------------------
    {
      name: 'quantidade_combustivel',
      label: 'Combustível (L)',
      type: 'number',
      required: true,
    },
    {
      name: 'tipo_combustivel_id',
      label: 'Tipo de Combustível',
      type: 'select',
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      required: true,
    },

    // -------------------------
    // ÓLEO / PERÍODO
    // -------------------------
    {
      name: 'quantidade_oleo',
      label: 'Óleo (L)',
      type: 'number',
    },
    {
      name: 'periodo_uso_dias',
      label: 'Período de Uso (dias)',
      type: 'number',
    },

    // -------------------------
    // OUTROS
    // -------------------------
    {
      name: 'observacao',
      label: 'Observação',
      type: 'textarea',
    },
  ]
}


// --------------------------------------------------------
// DATATABLE
// --------------------------------------------------------
export const guiaAbastecimentoListSchema: TableSchema = {
  columns: [
    {
      key: 'data_hora',
      label: 'Data',
      format: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'tipo_atividade_nome',
      label: 'Atividade',
      sortKey: 'tipo_atividade__nome',
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
      key: 'veiculo_display',
      label: 'Veículo',
    },
    {
      key: 'quantidade_combustivel',
      label: 'Combustível (L)',
      format: (val) => val ? `${val} L` : '-',
    }
  ],
}


// --------------------------------------------------------
// VIEW (MODAL)
// --------------------------------------------------------
export const guiaViewSchema: ViewSchema<GuiaAbastecimentoReadDTO> = {
  title: (item) => `Guia #${item.id}`,

  subtitle: (item) => {
    const data = new Date(item.data_hora)
    return data.toLocaleString('pt-BR')
  },

  fields: [
    { label: 'Atividade', key: 'tipo_atividade_nome' },
    { label: 'Veículo', key: 'veiculo_display' },
    { label: 'Motorista', key: 'pessoa_nome' },
    { label: 'Rota', key: 'rota_nome' },

    {
      label: 'Combustível',
      render: (item) =>
        `${item.quantidade_combustivel} L (${item.tipo_combustivel_nome})`
    },

    {
      label: 'Óleo',
      render: (item) =>
        item.quantidade_oleo
          ? `${item.quantidade_oleo} L`
          : '-'
    },

    {
      label: 'Observações',
      key: 'observacao',
      fullWidth: true
    }
  ]
}
