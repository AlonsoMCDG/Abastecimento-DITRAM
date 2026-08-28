import { ENDPOINTS } from "../../../../core/api/endpoints"
import type { FormSchema, TableSchema } from "../../../../core/types/form"
import type { ViewSchema } from "../../../../core/types/views"
import type { 
  GuiaAbastecimentoFormInput 
} from "./guia.form"
import type { GuiaAbastecimentoReadDTO } from "./guia.dto"

// --------------------------------------------------------
// FORMULÁRIO (UI SCHEMA)
// --------------------------------------------------------
export const guiaAbastecimentoUISchema:
  FormSchema<GuiaAbastecimentoFormInput> = {
  fields: [
    {
      name: 'modalidade',
      label: 'Modalidade de Abastecimento',
      type: 'select',
      options: [
        { label: 'Ônibus', value: 'ONIBUS'},
        { label: 'Caminhonete', value: 'CAMINHONETE'},
        { label: 'Carro', value: 'CARRO'},
        { label: 'Moto', value: 'MOTO'},
        { label: 'Catraia', value: 'CATRAIA'},
        { label: 'Corote', value: 'COROTE'},
        { label: "Caminhão", value: "CAMINHAO" },
        { label: 'Carro passeio', value: 'CARRO_PASSEIO'},
      ],
      required: true,
      colSpan: 1,
    },

    {
      name: 'secretaria_id',
      label: 'Secretaria',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      required: true,
    },

    {
      name: 'tipo_atividade',
      label: 'Atividade / Serviço prestado',
      type: 'select',
      endpoint: ENDPOINTS.operacao.tiposAtividadeLookup,
      required: true,
      creatable: true
    },

    {
      name: 'data_hora',
      label: 'Data e Hora',
      type: "datetime-local",
      required: true,
    },

    {
      name: 'pessoa_id',
      label: 'Motorista / Barqueiro',
      type: 'select',
      endpoint: ENDPOINTS.pessoas.lookup,
      required: true,
    },


    // -------------------------
    // VEÍCULO (UNIFICADO)
    // -------------------------
    {
      name: 'veiculo',
      label: 'Veículo (Busca ou Descrição)',
      type: 'select',
      endpoint: ENDPOINTS.frota.veiculosLookup,
      creatable: true,
      dependsOn: 'veiculo_modo'
    },

    {
      name: 'tipo_veiculo',
      label: 'Categoria do Veículo',
      type: 'select',
      options: [
        { label: 'Carro', value: 'CARRO' },
        { label: 'Caminhonete', value: 'CAMINHONETE' },
        { label: 'Caminhão', value: 'CAMINHAO' },
        { label: 'Ônibus', value: 'ONIBUS' },
        { label: 'Moto', value: 'MOTO' },
        { label: 'Van', value: 'VAN' },
        { label: 'Barco', value: 'BARCO' },
        { label: 'Máquina Pesada', value: 'MAQUINA_PESADA' },
      ],
      visibleIf: (values) => {
        // Esconde o campo se for BARQUEIRO
        // (o tipo já é fixado em BARCO no backend)
        if (values.modalidade === 'BARQUEIRO') {
          return false;
        }
        
        // Mostra apenas quando o veículo não é um ID numérico (no caso, texto avulso ou vazio)
        return typeof values.veiculo !== 'number';
      }
    },


    // -------------------------
    // ROTA (UNIFICADA)
    // -------------------------
    {
      name: 'rota',
      label: 'Rota',
      type: 'select',
      endpoint: ENDPOINTS.frota.rotasLookup,
      creatable: true,
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
      suffix: 'Litros',
    },

    {
      name: 'tipo_combustivel_id',
      label: 'Tipo de Combustível',
      type: 'select',
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      required: true,
    },


    // -------------------------
    // ÓLEO / PERÍODO / HODÔMETRO
    // -------------------------
    {
      name: 'quantidade_oleo',
      label: 'Óleo (L)',
      type: 'number',
      suffix: 'Litros',
    },
    
    {
      name: 'hodometro_quebrado',
      label: 'O Hodômetro / Horímetro está quebrado?',
      type: 'checkbox',
      visibleIf: (
        values: Partial<GuiaAbastecimentoFormInput>
      ) => {
        const modalidadesSemHodometro = [
          'BARQUEIRO',
          'COROTE'
        ];
        
        return !modalidadesSemHodometro.includes(
          values.modalidade ?? ''
        );
      }
    },

    {
      name: 'hodometro',
      label: 'Hodômetro / Horímetro',
      type: 'number',
      visibleIf: (
        values: Partial<GuiaAbastecimentoFormInput>
      ) => {
        const modalidadesSemHodometro = [
          'BARQUEIRO',
          'COROTE'
        ];
        
        // 1. Modalidades sem hodômetro não exibem o campo.
        if (
          modalidadesSemHodometro.includes(
            values.modalidade ?? ''
          )
        ) {
          return false;
        }
        
        // 2. Se o hodômetro estiver quebrado, não exibe.
        return !values.hodometro_quebrado;
      },
    },
    
    {
      name: 'periodo_uso_dias',
      label: 'Período de Uso (dias)',
      type: 'number',
      suffix: 'dias',
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
      format: (val) =>
        val 
          ? new Date(val as string).toLocaleDateString('pt-BR') 
          : '-',
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
      format: (val) => 
        val ? `${val} L` : '-',
    }
  ],
}


// --------------------------------------------------------
// VIEW (MODAL)
// --------------------------------------------------------
export const guiaViewSchema: 
  ViewSchema<GuiaAbastecimentoReadDTO> = {
  title: (item) => `Guia #${item.id}`,

  subtitle: (item) => {
    const data = new Date(item.data_hora)

    return data.toLocaleString('pt-BR')
  },

  fields: [
    { 
      label: 'Atividade', 
      key: 'tipo_atividade_nome' 
    },

    { 
      label: 'Veículo', 
      key: 'veiculo_display' 
    },

    { 
      label: 'Motorista', 
      key: 'pessoa_nome' 
    },
    
    // Usa o campo de fallback do ReadDTO
    // caso a rota não tenha ID
    { 
      label: 'Rota', 
      render: (item) => 
        item.rota_nome 
        || item.rota_manual 
        || '-'
    },

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
