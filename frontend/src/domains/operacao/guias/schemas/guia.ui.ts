import type { TableSchema } from '../../../../core/types/form';
import type { GuiaAbastecimentoReadDTO } from './guia.dto';
import type { ViewSchema } from '../../../../core/types/views';

export const guiaAbastecimentoListSchema: TableSchema = {
  columns: [
    {
      key: 'data_hora',
      label: 'Data',
      format: (val) => val ? new Date(val as string).toLocaleDateString('pt-BR') : '-',
    },
    { key: 'modalidade', label: 'Tipo / Operação' },
    { key: 'rota_manual', label: 'Rota / Serviço' },
    { key: 'pessoa_nome', label: 'Motorista' },
    { key: 'secretaria_sigla', label: 'Secretaria' },
    { key: 'veiculo_display', label: 'Veículo / Equipamento' },
    {
      key: 'quantidade_combustivel',
      label: 'Combustível (L)',
      format: (val) => val ? `${val} L` : '-',
    },
  ],
};

export const guiaViewSchema: ViewSchema<GuiaAbastecimentoReadDTO> = {
  title: (item) => `Guia #${item.id}`,
  subtitle: (item) => new Date(item.data_hora).toLocaleString('pt-BR'),
  fields: [
    { label: 'Tipo de Guia / Operação', key: 'modalidade' },
    { label: 'Secretaria', key: 'secretaria_nome' },
    { label: 'Motorista / Condutor', key: 'pessoa_nome' },
    { label: 'Veículo / Equipamento', key: 'veiculo_display' },
    { label: 'Instituição / Local', render: (item) => item.instituicao_nome || '-' },
    { label: 'Rota / Serviço', render: (item) => item.rota_manual || item.rota_nome || '-' },
    { label: 'Combustível', render: (item) => `${item.quantidade_combustivel} L (${item.tipo_combustivel_nome})` },
    { label: 'Óleo', render: (item) => item.quantidade_oleo ? `${item.quantidade_oleo} L` : '-' },
    { label: 'Hodômetro', render: (item) => item.hodometro_quebrado ? 'Não disponível' : (item.hodometro ?? '-') },
    { label: 'Período de uso', render: (item) => item.periodo_uso_dias ? `${item.periodo_uso_dias} dias` : '-' },
    { label: 'Observações', key: 'observacao', fullWidth: true },
  ],
};
