import type { GuiaAbastecimentoFormInput, GuiaAbastecimentoFormOutput } from "../schemas/guia.form";
import type { GuiaAbastecimentoWriteDTO, GuiaAbastecimentoReadDTO } from "../schemas/guia.dto";

// FORM → API
export function mapFormToWriteDTO(
  form: GuiaAbastecimentoFormOutput
): GuiaAbastecimentoWriteDTO {

  const {
    modalidade,
    tipo_atividade,
    rota,
    veiculo,
    tipo_veiculo,
    hodometro,
    hodometro_quebrado,
    ...rest
  } = form

  let final_veiculo_id: number | null = null;
  let final_veiculo_descricao: string | null = null;
  let final_tipo_veiculo: string | null = null;

  // --- ROTEAMENTO INTELIGENTE DO VEÍCULO ---

  if (modalidade === 'BARQUEIRO') {
    // Regra do Barqueiro: Sem ID, Tipo é fixo, Descrição usa o que foi digitado ou assume "Barco"
    final_veiculo_id = null;
    final_tipo_veiculo = "BARCO";
    final_veiculo_descricao = (typeof veiculo === 'string' && veiculo.trim() !== '') ? veiculo : "Barco";
  }
  else {
    // Veículo Cadastrado (ID)
    if (typeof veiculo === 'number') {
      final_veiculo_id = veiculo;
      final_veiculo_descricao = null;
      final_tipo_veiculo = null; // O backend não precisa do tipo se já tem o ID
    } 
    // Veículo Avulso (Texto)
    else if (typeof veiculo === 'string' && veiculo.trim() !== '') {
      final_veiculo_id = null;
      final_veiculo_descricao = veiculo;
      final_tipo_veiculo = tipo_veiculo ?? null;
    }
  }

  return {
    ...rest,
    // --- ROTEAMENTO DO VEÍCULO ---
    modalidade,
    veiculo_id: final_veiculo_id,
    veiculo_descricao: final_veiculo_descricao,
    tipo_veiculo: final_tipo_veiculo,
    
    // --- LIMPEZA DO HODÔMETRO ---
    hodometro_quebrado: hodometro_quebrado ?? false,
    hodometro: hodometro_quebrado ? null : (hodometro ?? null),

    // --- ROTEAMENTO DA ROTA ---
    rota_id: typeof rota === 'number' ? rota : null,
    rota_manual: typeof rota === 'string' ? rota : null,
    
    // --- ROTEAMENTO DA ATIVIDADE ---
    tipo_atividade_id: typeof tipo_atividade === 'number' ? tipo_atividade : null,
    tipo_atividade_nome: typeof tipo_atividade === 'string' ? tipo_atividade : undefined,

  }
}

// API → FORM
export function mapReadToForm(
  data: GuiaAbastecimentoReadDTO
): GuiaAbastecimentoFormInput {

  const {
    tipo_atividade_id,
    
    veiculo_id,
    veiculo_display,
    tipo_veiculo,
    
    rota_id,
    rota_manual,
    
    ...rest
  } = data

  // Prioriza o ID. Se não tiver ID, joga a descrição na tela pro usuário ver e editar
  const veiculoRestaurado = veiculo_id ? veiculo_id : veiculo_display;

  // Agrupando a rota (prioriza ID, depois manual, depois nulo)
  const rota = rota_id ? rota_id : (rota_manual ? rota_manual : null);

  return {
    ...rest,
    veiculo: veiculoRestaurado,
    tipo_veiculo: tipo_veiculo ?? undefined,
    rota,
    tipo_atividade: tipo_atividade_id ?? ""
  }
}