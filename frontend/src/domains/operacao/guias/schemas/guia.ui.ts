import { ENDPOINTS } from '../../../../core/api/endpoints';
import type { FormSchema, TableSchema } from '../../../../core/types/form';
import type { GuiaAbastecimentoFormInput } from './guia.form';
import type { GuiaAbastecimentoReadDTO } from './guia.dto';
import type { ViewSchema } from '../../../../core/types/views';

export const guiaAbastecimentoUISchema: FormSchema<GuiaAbastecimentoFormInput> = {
  fields: [
    { name: 'data_hora', label: 'Data e Hora', type: 'datetime-local', required: true },
    {
      name: 'tipo_atividade',
      label: 'Rota / Serviço',
      type: 'select',
      endpoint: ENDPOINTS.operacao.tiposAtividadeLookup,
      required: true,
      creatable: true,
    },
    {
      name: 'secretaria_id',
      label: 'Secretaria',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      required: true,
    },
    {
      name: 'pessoa_id',
      label: 'Motorista / Condutor',
      type: 'select',
      endpoint: ENDPOINTS.pessoas.lookup,
      required: true,
    },
    {
      name: 'modalidade',
      label: 'Tipo do recurso abastecido',
      type: 'select',
      endpoint: ENDPOINTS.choices.guiaModalidade,
      required: true,
    },
    {
      name: 'veiculo',
      label: 'Veículo / Equipamento',
      type: 'select',
      endpoint: ENDPOINTS.frota.veiculosLookup,
      creatable: true,
      required: true,
    },
    {
      name: 'tipo_veiculo',
      label: 'Categoria do veículo / equipamento',
      type: 'select',
      endpoint: ENDPOINTS.choices.guiaTipoVeiculo,
      visibleIf: (values) => typeof values.veiculo !== 'number',
      required: true,
    },
    {
      name: 'instituicao_id',
      label: 'Instituição / Local atendido',
      type: 'select',
      endpoint: ENDPOINTS.organizacao.instituicoesLookup,
    },
    {
      name: 'rota',
      label: 'Rota específica',
      type: 'select',
      endpoint: ENDPOINTS.frota.rotasLookup,
      creatable: true,
    },
    {
      name: 'tipo_combustivel_id',
      label: 'Tipo de Combustível',
      type: 'select',
      endpoint: ENDPOINTS.frota.tiposCombustivelLookup,
      required: true,
    },
    {
      name: 'quantidade_combustivel',
      label: 'Quantidade de Combustível',
      type: 'number',
      required: true,
      suffix: 'Litros',
    },
    { name: 'quantidade_oleo', label: 'Quantidade de Óleo', type: 'number', suffix: 'Litros' },
    { name: 'periodo_uso_dias', label: 'Período de Uso', type: 'number', suffix: 'dias' },
    { name: 'hodometro_quebrado', label: 'Hodômetro não disponível / quebrado', type: 'checkbox' },
    {
      name: 'hodometro',
      label: 'Hodômetro',
      type: 'number',
      suffix: 'km',
      visibleIf: (values) => !values.hodometro_quebrado,
    },
    { name: 'observacao', label: 'Observação', type: 'textarea', colSpan: 3 },
  ],
};

export const guiaAbastecimentoListSchema: TableSchema = {
  columns: [
    { key: 'data_hora', label: 'Data', format: (val) => val ? new Date(val as string).toLocaleDateString('pt-BR') : '-' },
    { key: 'tipo_atividade_nome', label: 'Rota / Serviço', sortKey: 'tipo_atividade__nome' },
    { key: 'pessoa_nome', label: 'Motorista', sortKey: 'pessoa__nome' },
    { key: 'secretaria_sigla', label: 'Secretaria', sortKey: 'secretaria__sigla' },
    { key: 'veiculo_display', label: 'Veículo / Equipamento' },
    { key: 'quantidade_combustivel', label: 'Combustível (L)', format: (val) => val ? `${val} L` : '-' },
  ],
};

export const guiaViewSchema: ViewSchema<GuiaAbastecimentoReadDTO> = {
  title: (item) => `Guia #${item.id}`,
  subtitle: (item) => new Date(item.data_hora).toLocaleString('pt-BR'),
  fields: [
    { label: 'Rota / Serviço', key: 'tipo_atividade_nome' },
    { label: 'Veículo / Equipamento', key: 'veiculo_display' },
    { label: 'Motorista', key: 'pessoa_nome' },
    { label: 'Secretaria', key: 'secretaria_nome' },
    { label: 'Instituição / Local', render: (item) => item.instituicao_nome || '-' },
    { label: 'Rota específica', render: (item) => item.rota_nome || item.rota_manual || '-' },
    { label: 'Combustível', render: (item) => `${item.quantidade_combustivel} L (${item.tipo_combustivel_nome})` },
    { label: 'Óleo', render: (item) => item.quantidade_oleo ? `${item.quantidade_oleo} L` : '-' },
    { label: 'Hodômetro', render: (item) => item.hodometro_quebrado ? 'Não disponível' : (item.hodometro ?? '-') },
    { label: 'Período de uso', render: (item) => item.periodo_uso_dias ? `${item.periodo_uso_dias} dias` : '-' },
    { label: 'Observações', key: 'observacao', fullWidth: true },
  ],
};