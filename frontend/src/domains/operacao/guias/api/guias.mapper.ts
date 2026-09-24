import type { GuiaAbastecimentoFormOutput, GuiaAbastecimentoFormInput } from '../schemas/guia.form';
import type { GuiaAbastecimentoWriteDTO, GuiaAbastecimentoReadDTO } from '../schemas/guia.dto';

export function mapFormToWriteDTO(form: GuiaAbastecimentoFormOutput): GuiaAbastecimentoWriteDTO {
  const {
    modalidade,
    pessoa_id,
    secretaria_id,
    instituicao_id,
    tipo_combustivel_id,
    veiculo,
    tipo_veiculo,
    rota_manual,
    hodometro,
    hodometro_quebrado,
    ...rest
  } = form;

  const registeredVehicle = typeof veiculo === 'number';

  return {
    ...rest,
    modalidade,
    pessoa_id,
    secretaria_id,
    instituicao_id: instituicao_id ?? null,
    tipo_combustivel_id,
    veiculo_id: registeredVehicle ? veiculo : null,
    veiculo_descricao: registeredVehicle
      ? null
      : (typeof veiculo === 'string' ? veiculo.trim() : null),
    tipo_veiculo: registeredVehicle ? null : (tipo_veiculo?.trim() || null),
    rota_id: null,
    rota_manual: rota_manual.trim(),
    tipo_atividade_id: null,
    tipo_atividade_nome: undefined,
    hodometro_quebrado: hodometro_quebrado ?? false,
    hodometro: hodometro_quebrado ? null : (hodometro ?? null),
  };
}

export function mapReadToForm(data: GuiaAbastecimentoReadDTO): GuiaAbastecimentoFormInput {
  return {
    data_hora: data.data_hora ? new Date(data.data_hora).toISOString().slice(0, 16) : '',
    modalidade: data.modalidade,
    secretaria_id: data.secretaria_id,
    pessoa_id: data.pessoa_id,
    veiculo: data.veiculo_id != null ? data.veiculo_id : (data.veiculo_display || ''),
    tipo_veiculo: data.tipo_veiculo ?? undefined,
    instituicao_id: data.instituicao_id ?? null,
    rota_manual: data.rota_manual ?? data.rota_nome ?? '',
    tipo_combustivel_id: data.tipo_combustivel_id,
    quantidade_combustivel: data.quantidade_combustivel,
    quantidade_oleo: data.quantidade_oleo ?? null,
    periodo_uso_dias: data.periodo_uso_dias ?? null,
    hodometro: data.hodometro ?? null,
    hodometro_quebrado: data.hodometro_quebrado ?? false,
    observacao: data.observacao ?? null,
  };
}
