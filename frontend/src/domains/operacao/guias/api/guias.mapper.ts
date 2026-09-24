import type { GuiaAbastecimentoFormOutput, GuiaAbastecimentoFormInput } from '../schemas/guia.form';
import type { GuiaAbastecimentoWriteDTO, GuiaAbastecimentoReadDTO } from '../schemas/guia.dto';

export function mapFormToWriteDTO(form: GuiaAbastecimentoFormOutput): GuiaAbastecimentoWriteDTO {
  const {
    modalidade,
    pessoa_id,
    secretaria_id,
    instituicao_id,
    tipo_combustivel_id,
    tipo_atividade,
    rota,
    veiculo,
    tipo_veiculo,
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
    veiculo_descricao: registeredVehicle ? null : (typeof veiculo === 'string' ? veiculo.trim() : null),
    tipo_veiculo: registeredVehicle ? null : (tipo_veiculo ?? null),
    hodometro_quebrado: hodometro_quebrado ?? false,
    hodometro: hodometro_quebrado ? null : (hodometro ?? null),
    rota_id: typeof rota === 'number' ? rota : null,
    rota_manual: typeof rota === 'string' ? rota.trim() : null,
    tipo_atividade_id: typeof tipo_atividade === 'number' ? tipo_atividade : null,
    tipo_atividade_nome: typeof tipo_atividade === 'string' ? tipo_atividade.trim() : undefined,
  };
}

export function mapReadToForm(data: GuiaAbastecimentoReadDTO): GuiaAbastecimentoFormInput {
  const {
    tipo_atividade_id,
    veiculo_id,
    veiculo_display,
    tipo_veiculo,
    rota_id,
    rota_manual,
    ...rest
  } = data;

  return {
    ...rest,
    veiculo: veiculo_id != null ? veiculo_id : (veiculo_display || ''),
    tipo_veiculo: tipo_veiculo ?? undefined,
    rota: rota_id != null ? rota_id : (rota_manual ?? null),
    tipo_atividade: tipo_atividade_id ?? '',
  };
}