import { ENDPOINTS } from "../../../../core/api/endpoints";
import type { FormSchema, TableSchema } from "../../../../core/types/form";
import type { ViewSchema } from "../../../../core/types/views";
import { MASKS } from "../../../../core/utils/masks";
import type { RotaReadDTO } from "./rota.read.zod";

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO
// --------------------------------------------------------
export const rotaUISchema: FormSchema = {
  fields: [
    {
      name: 'nome',
      label: 'Nome da Rota',
      placeholder: 'Ex.: "ROTA RIO BRANCO", "ROTA MERENDA ESCOLAR"',
      type: 'text',
      colSpan: 3,
      required: true,
    },
    {
      name: 'secretaria_id',
      label: 'Secretaria Vinculada',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      colSpan: 3,
      required: true,
    },
    {
      name: 'distancia_km',
      label: 'Distância do percurso',
      type: 'text',
      suffix: 'km',
      placeholder: '0,00',
      colSpan: 2,
      required: false,
      mask: MASKS.DECIMAL,
    },
    {
      name: 'detalhes',
      label: 'Detalhes ou pontos de referência (opcional)',
      type: 'textarea',
      colSpan: 3,
      required: false,
    },
    {
      name: 'ativa',
      label: 'Rota Ativa no sistema',
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
      key: 'nome',
      label: 'Nome da Rota',
      sortKey: 'nome',
    },
    {
      key: 'secretaria_sigla', 
      label: 'Secretaria',
      sortKey: 'secretaria__sigla',
    },
    {
      key: 'distancia_km', 
      label: 'Distância',
      sortKey: 'distancia_km',
      format: (val: number | null) => val ? `${val} km` : 'Não informada'
    },
    {
      key: 'ativa', 
      label: 'Status',
      sortKey: 'ativa',
      format: (val: boolean) => val ? '✅ Ativa' : '❌ Inativa',
    },
  ]
};

// --------------------------------------------------------
// MODAL DE QUICK VIEW
// --------------------------------------------------------
export const rotaViewSchema: ViewSchema<RotaReadDTO> = {
  title: (item) => `Rota #${item.id}`,
  fields: [
    { label: 'Nome da Rota', key: 'nome', fullWidth: true },
    { label: 'Secretaria', key: 'secretaria_nome' },
    { 
      label: 'Distância Média', 
      render: (item) => item.distancia_km ? `${item.distancia_km} km` : 'Não informada' 
    },
    { label: 'Detalhes', key: 'detalhes', fullWidth: true },
  ]
};