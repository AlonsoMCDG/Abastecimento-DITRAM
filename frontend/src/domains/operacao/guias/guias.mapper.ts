import type { GuiaAbastecimentoFormData } from "./schemas/guia.form.zod"
import type { GuiaAbastecimentoWriteDTO } from "./schemas/guia.write.zod"
import type { GuiaAbastecimentoReadDTO } from "./schemas/guia.read.zod"

// FORM → API
export function mapFormToWriteDTO(
  form: GuiaAbastecimentoFormData
): GuiaAbastecimentoWriteDTO {

  const {
    tipo_atividade,
    ...rest
  } = form

  let veiculo_id = rest.veiculo_id;
  let tipo_veiculo = rest.tipo_veiculo;
  let veiculo_descricao = rest.veiculo_descricao;

  // Se escolheu o ID, apaga os outros
  if (veiculo_id) { tipo_veiculo = null; veiculo_descricao = null; } 

  // Se escolheu o Tipo, apaga a descrição
  else if (tipo_veiculo) { veiculo_descricao = null; }
  
  return {
    ...rest,
    veiculo_id,
    tipo_veiculo,
    veiculo_descricao,

    tipo_atividade_id: tipo_atividade.value ?? null,
    tipo_atividade_nome: tipo_atividade.value
      ? undefined
      : tipo_atividade.label
  }
}


// API → FORM
export function mapReadToForm(
  data: GuiaAbastecimentoReadDTO
): GuiaAbastecimentoFormData {

  const {
    tipo_atividade_id,
    tipo_atividade_nome,
    ...rest
  } = data

  return {
    ...rest,
    tipo_atividade: {
      value: tipo_atividade_id,
      label: tipo_atividade_nome ?? ""
    }
  }
}