import type { 
  GuiaAbastecimentoFormInput, 
  GuiaAbastecimentoFormOutput 
} from "../schemas/guia.form";
import type { 
  GuiaAbastecimentoWriteDTO, 
  GuiaAbastecimentoReadDTO 
} from "../schemas/guia.dto";


// ============================================================
// FORM → API
// ============================================================

export function mapFormToWriteDTO(
  form: GuiaAbastecimentoFormOutput
): GuiaAbastecimentoWriteDTO {

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
  } = form

  let final_veiculo: number | null = null;
  let final_veiculo_descricao: string | null = null;
  let final_tipo_veiculo: string | null = null;

  // --- ROTEAMENTO INTELIGENTE DO VEÍCULO ---

  if (modalidade === 'CATRAIA') {
    // Regra da embarcação (Catraia): Sem ID, Tipo é fixo em CATRAIA,
    // Descrição usa o que foi digitado ou assume "Catraia"
    // (alinhado com guia.form.ts; BARQUEIRO não existe nas choices do backend)

    final_veiculo = null;

    final_tipo_veiculo = "CATRAIA";

    final_veiculo_descricao =
      typeof veiculo === 'string' && veiculo.trim() !== ''
        ? veiculo
        : "Catraia";

  } else {

    // Veículo Cadastrado (ID)
    if (typeof veiculo === 'number') {

      final_veiculo = veiculo;
      final_veiculo_descricao = null;
      final_tipo_veiculo = null; // O backend não precisa do tipo se já tem o ID

    } 

    // Veículo Avulso (Texto)
    else if (
      typeof veiculo === 'string' && 
      veiculo.trim() !== ''
    ) {

      final_veiculo = null;
      final_veiculo_descricao = veiculo;
      final_tipo_veiculo = tipo_veiculo ?? null;
      
    }
  }


  // ==========================================================
  // RETORNO
  // ==========================================================

  return {
    ...rest,
    
    modalidade,
    
    // FKs
    pessoa: pessoa_id,

    secretaria: secretaria_id,

    instituicao: instituicao_id ?? null,

    tipo_combustivel: tipo_combustivel_id,
    

    // --- ROTEAMENTO DO VEÍCULO ---
    veiculo: final_veiculo,

    veiculo_descricao: final_veiculo_descricao,

    tipo_veiculo: final_tipo_veiculo,

    
    // --- LIMPEZA DO HODÔMETRO ---
    hodometro_quebrado: hodometro_quebrado ?? false,

    hodometro: 
      hodometro_quebrado 
        ? null 
        : (hodometro ?? null),

    
    // --- ROTEAMENTO DA ROTA ---
    rota: 
      typeof rota === 'number' 
        ? rota 
        : null,
    
    rota_manual: 
      typeof rota === 'string' 
        ? rota 
        : null,
    
    
    // --- ROTEAMENTO DA ATIVIDADE ---
    tipo_atividade: 
      typeof tipo_atividade === 'number' 
        ? tipo_atividade 
        : null,

    tipo_atividade_nome: 
      typeof tipo_atividade === 'string' 
        ? tipo_atividade 
        : undefined,
  };
}


// ============================================================
// API → FORM
// ============================================================

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

  // Prioriza o ID do veículo.
  // Caso não exista, utiliza a descrição.
  const veiculoRestaurado = 
    veiculo_id 
      ? veiculo_id 
      : veiculo_display;

  
  // Prioriza rota por ID.
  // Caso não exista, utiliza a rota manual.
  const rota = 
    rota_id != null 
      ? rota_id 
      : (rota_manual ?? null);


  return {
    ...rest,

    veiculo: veiculoRestaurado,

    tipo_veiculo: 
      tipo_veiculo ?? undefined,

    rota,

    tipo_atividade: 
      tipo_atividade_id ?? ""
  };
}