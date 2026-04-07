import type { FormSchema, TableSchema } from "../types/form"
import { ENDPOINTS } from "../api/config/endpoints"

// --------------------------------------------------------
// FORMULÁRIO DE CRIAÇÃO / EDIÇÃO (DynamicForm)
// --------------------------------------------------------
export const guiaAbastecimentoFormSchema: FormSchema = {
  fields: [
    {
      name: "data_hora",
      label: "Data e Hora",
      type: "datetime-local",
      required: true,
    },
    {
      name: "secretaria",
      label: "Secretaria",
      type: "select",
      required: true,
      endpoint: ENDPOINTS.organizacao.secretariasLookup,
      optionLabel: "label",
      autoSelectFirst: true,
    },
    {
      name: "tipo_servico",
      label: "Tipo de Serviço",
      type: "select",
      required: false,
      allowFreeText: true,
      endpoint: ENDPOINTS.operacao.tiposServicoLookup,
      optionLabel: "label",
    },
    {
      name: "pessoa",
      label: "Motorista / Operador",
      type: "select",
      required: true,
      endpoint: ENDPOINTS.pessoas.lookup,
      optionLabel: "label",
      dependsOn: "rota",
      dependsOnParam: "rota",
      disabledUntilParentSelected: true,
    },
    {
      name: "rota",
      label: "Rota",
      type: "select",
      required: false,
      allowFreeText: true,
      endpoint: ENDPOINTS.frota.rotasLookup,
      optionLabel: "label",
      dependsOn: "secretaria",
      dependsOnParam: "secretaria",
      disabledUntilParentSelected: true,
    },
    {
      name: "instituicao",
      label: "Instituição",
      type: "select",
      required: true,
      endpoint: ENDPOINTS.organizacao.instituicoesLookup,
      optionLabel: "label",
      dependsOn: "secretaria",
      dependsOnParam: "secretaria",
      disabledUntilParentSelected: true,
      autoSelectFirst: true,
    },
    {
      name: "veiculo",
      label: "Veículo",
      type: "select",
      required: true,
      endpoint: ENDPOINTS.frota.veiculosLookup,
      optionLabel: "label",
      dependsOn: "secretaria",
      dependsOnParam: "secretaria",
      disabledUntilParentSelected: true,
    },
    {
      name: "quantidade_combustivel",
      label: "Quantidade de Combustível (L)",
      type: "number",
      required: true,
    },
    {
      name: "quantidade_oleo",
      label: "Quantidade de Óleo Lubrificante (L)",
      type: "number",
      required: false,
    },
    {
      name: "hodometro_atual",
      label: "Hodômetro",
      type: "number",
      required: true,
    },
    {
      name: "observacao",
      label: "Observação",
      type: "textarea",
      required: false,
    },
  ],
}

// --------------------------------------------------------
// DATATABLE (LISTAGEM) - FOCO NO ESSENCIAL
// --------------------------------------------------------

export const guiaAbastecimentoListSchema: TableSchema = {
  columns: [
    {
      key: "data_hora",
      label: "Data",
      // Função nativa do TableSchema para formatar o valor na tela
      format: (val) => val ? new Date(val).toLocaleDateString("pt-BR") : "-",
    },
    {
      // O backend deve enviar esse campo preenchido (ou você pode mapear caso ele venha aninhado)
      key: "veiculo_placa", 
      label: "Veículo",
    },
    {
      key: "pessoa_nome",
      label: "Motorista",
    },
    {
      key: "secretaria_sigla",
      label: "Secretaria",
    },
    {
      key: "quantidade_combustivel",
      label: "Combustível (L)",
      format: (val) => val ? `${val} L` : "-",
    }
  ],
}

