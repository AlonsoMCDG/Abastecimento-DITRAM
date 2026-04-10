import { ENDPOINTS } from "../api/config/endpoints";
import type { FormSchema, TableSchema } from "../types/form";
import { MASKS } from "../utils/masks";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const rotaFormSchema: FormSchema = {
  fields: [
    {
      name: 'nome',
      label: 'Nome curto',
      placeholder: 'Ex.: "ROTA RIO BRANCO", "ROTA MERENDA"',
      type: 'text',
      colSpan: 2,
      required: true,
    },
    {
      name: 'tipo_locomocao',
      label: 'Tipo de Locomoção',
      type: 'select',
      options: [
        { value: 'TERRESTRE', label: 'Terrestre' },
        { value: 'FLUVIAL', label: 'Fluvial' },
      ],
      colSpan: 1,
      required: true,
    },
    {
      name: 'secretaria_id',
      label: 'Secretaria',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      colSpan: 1,
      required: true,
    },
    {
      name: 'instituicao_id',
      label: 'Instituição / Local',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.instituicoesLookup,
      placeholder: 'Selecione uma instituição...',
      colSpan: 2,
      required: true,
    },
    {
      name: 'distancia_km',
      label: 'Distância do percurso (km)',
      type: 'text',
      suffix: 'km',
      placeholder: '0,00',
      colSpan: 1,
      required: true,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'consumo_estimado_combustivel',
      label: 'Consumo estim. Combustível',
      type: 'text',
      suffix: 'Litros',
      placeholder: '0,0',
      colSpan: 1,
      required: true,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'consumo_estimado_oleo',
      label: 'Consumo estim. Óleo',
      type: 'text',
      suffix: 'Litros',
      placeholder: '0,0',
      colSpan: 1,
      required: true,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'detalhes',
      label: 'Outros detalhes (opcional)',
      type: 'textarea',
      colSpan: 3,
      required: false,
    },
    {
      name: 'ativa',
      label: 'Rota Ativa',
      type: 'checkbox',
      colSpan: 3,
      required: false,
    },
  ],
};

// --------------------------------------------------------
// DATATABLE (LISTAGEM)
// --------------------------------------------------------
export const rotaListSchema: TableSchema = {
  columns: [
    {
      key: 'id',
      label: 'ID',
    },
    {
      key: 'nome',
      label: 'Nome',
      sortKey: 'nome',
    },
    {
      key: 'tipo_locomocao_nome', 
      label: 'Locomoção',
      sortKey: 'tipo_locomocao', // Choice fields usam a própria chave
    },
    {
      key: 'secretaria_sigla', 
      label: 'Secretaria',
      sortKey: 'secretaria__sigla',
    },
    {
      key: 'instituicao_nome', 
      label: 'Instituição Atendida',
      sortKey: 'instituicao__nome',
    },
    {
      key: 'ativa', 
      label: 'Status',
      sortKey: 'ativa',
      format: (val: boolean) => val ? '✅ Ativa' : '❌ Inativa',
    },
  ]
};