import type { GuiaAbastecimentoFormData } from "./schemas/guia.form.zod"
import type { GuiaAbastecimentoWriteDTO } from "./schemas/guia.write.zod"
import type { GuiaAbastecimentoReadDTO } from "./schemas/guia.read.zod"

// FORM → API
export function mapFormToWriteDTO(
  form: GuiaAbastecimentoFormData
): GuiaAbastecimentoWriteDTO {

  const {
    tipo_atividade, // Pode ser 'number' (id existente) ou 'string' (nome novo digitado)
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

    // Roteamento Automático de Atividade
    // Se for número, envia como ID. Se não, manda null.
    tipo_atividade_id: typeof tipo_atividade === 'number' ? tipo_atividade : null,
    
    // Se for string, envia como Nome. Se não, manda undefined (para o backend ignorar).
    tipo_atividade_nome: typeof tipo_atividade === 'string' ? tipo_atividade : undefined
  }
}

// API → FORM
export function mapReadToForm(
  data: GuiaAbastecimentoReadDTO
): GuiaAbastecimentoFormData {

  const {
    tipo_atividade_id,
    ...rest
  } = data

  return {
    ...rest,
    // O formulário só precisa do ID primitivo.
    // O SearchableAsyncSelect fará o lookup visual pelo ID carregado
    tipo_atividade: tipo_atividade_id ?? ""
  }
}